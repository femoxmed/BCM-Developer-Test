'use strict';

// Called by a durable worker with a persisted job and an exclusive lease.
// api.subscribe MUST support durable idempotency for the same key + payload.
async function deliverSignup(job, { api, save, now = Date.now, random = Math.random }) {
  if (['sent', 'invalid', 'review'].includes(job.state)) return job;
  if (job.nextAttemptAt > now()) return job;
  const email = typeof job.email === 'string' ? job.email.trim() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    job.state = 'invalid'; // Practical preliminary check; provider remains authoritative.
    job.reason = 'email_format';
    await save(job);
    return job;
  }
  job.attempts = (job.attempts || 0) + 1;
  job.state = 'pending';
  await save(job); // If persistence fails, do not send.
  let response;
  try {
    response = await api.subscribe({ email, listId: job.listId }, {
      idempotencyKey: job.key, timeoutMs: 5000,
    });
  } catch {
    response = { status: 0 }; // Unknown outcome: retry with the SAME stored key.
  }
  if (response.status >= 200 && response.status < 300) {
    job.state = 'sent';
    job.remoteId = response.id;
    delete job.reason;
  } else if ([400, 422].includes(response.status) && response.code === 'invalid_email') {
    job.state = 'invalid';
    job.reason = 'provider_email_rejected';
  } else if ([0, 408, 429].includes(response.status) || response.status >= 500) {
    const backoff = Math.min(3600000, 1000 * 2 ** Math.min(job.attempts - 1, 12));
    const header = response.retryAfter;
    const seconds = typeof header === 'string' && /^\d+$/.test(header) ? Number(header) : NaN;
    const retryAt = Number.isFinite(seconds) ? now() + seconds * 1000 : Date.parse(header);
    const delay = Math.max(backoff + Math.floor(random() * 1000), Number.isFinite(retryAt) ? retryAt - now() : 0);
    job.nextAttemptAt = now() + delay;
    job.reason = response.status === 429 ? 'rate_limited' : 'unknown_or_transient';
    if (job.attempts >= 8) job.state = 'review'; // Retain and alert; never silently discard.
  } else {
    job.state = 'review'; // Auth/configuration/unexpected response: investigate, don't loop.
    job.reason = 'unexpected_response';
  }
  await save(job);
  return job;
}
module.exports = { deliverSignup };
