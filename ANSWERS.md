# Assessment answers

## 1. PHP / WordPress

Corrected code: [q1/posts.php](q1/posts.php).

I corrected the query, ad replacement and output handling:

- I added `new` when creating `WP_Query`; without it, PHP attempts a function call.
- I kept `page` as the URL parameter required by the brief, but passed it to WordPress as `paged`. I validate it as a positive integer and default missing or invalid input to 1.
- I default missing search input to an empty string, reject arrays, then unslash and sanitise the value. I also escape it when displaying it.
- I replaced the undefined `$pages` value with `$q->max_num_pages` and closed the heading correctly.
- I escaped the brackets in the regex so it matches the literal `[ad]` marker. The original pattern matches individual `a` or `d` characters.
- I supplied the missing content argument and made the callback return the replacement instead of echoing it. I used a counter for slot numbers because `$m[1]` has no defined capture group.
- I used `esc_html(get_the_title())` because `the_title()` echoes before the escaping can happen.
- I passed rich content through WordPress’s content filters and used a div wrapper, since the content can already contain paragraphs and other blocks.
- I added `wp_reset_postdata()` after the custom loop so later template tags use the main post again.

I assumed the listing should show ten published posts per page, without sticky-post promotion. An empty search lists all posts. Missing results or an out-of-range page show an empty-state message; zero results gives “Page 1 of 0”.

I assumed `[ad]` is a case-sensitive, standalone editorial placeholder, not text inside attributes, code or inline markup. Each placeholder gets an ID containing the post ID and occurrence number, assuming each post appears once. I left loading to the advertising JavaScript. Replacement happens before content filtering, with an exact `<p>[ad]</p>` wrapper removed first. More flexible placement would need a structured parser or editor block.

For rich content, I rely on WordPress’s normal publishing permissions and trusted content pipeline. I would not treat `the_content` filters as a general HTML sanitiser.

Checks covered missing parameters, page 2, no results, multiple markers, unique IDs, unchanged ordinary letters, formatting and restoration of the main post. See `evidence/wordpress-integration.txt` and `evidence/php-lint.txt`.

## 2. An editor cannot upload images

I would first ask for the exact error, when it happened and the failing file. Then I would compare that same file using each person’s own session.

| What I would check, in order | Evidence I would look for | What I would do once confirmed |
| --- | --- | --- |
| File size, type or corruption | I would try a small known-good JPEG and inspect the failing file’s MIME/type, size and response body. | I would resize or re-export the file, or correct the upload limit if it is set incorrectly. |
| Session or browser problem | I would ask the editor to sign in again and retry in a clean browser profile, then check for authentication or nonce failures. | I would refresh the session or fix the identified browser, cookie or admin-cache issue. |
| Account restriction | I would check the actual `upload_files` capability, site membership, quota and custom plugin rules. | I would restore the intended access or correct the restriction without making the editor an administrator. |
| Server or request filtering | I would inspect PHP/upload logs, disk space, directory permissions, image processing and WAF request IDs. | I would fix the confirmed limit, permission or filtering issue. |

A colleague’s success would not rule out a server problem if their file or network path differs. After the fix, I would repeat the original upload, check generated image sizes and article insertion, and confirm another account still works.

## 3. Slow article pages

I would measure a representative article on mobile first, then choose a fix based on whether the delay comes from images, JavaScript or the server.

| Improvement I would consider | What I would measure first |
| --- | --- |
| Responsive, compressed images; lazy-load below-fold images | I would identify the LCP element and check image bytes, selected dimensions and request timing. I would avoid lazy-loading the hero if it is the LCP element. |
| Remove unused scripts and defer noncritical work | I would inspect long tasks, interaction delays, asset loading and third-party dependencies. |
| Improve public-page caching or slow backend work | I would compare TTFB, cache hits/misses, origin timing and slow queries for anonymous and signed-in sessions. |

If I chose image optimisation, I would compare the same article, device/network profile and consent state over several before/after runs. I would look for lower median LCP and transfer size without making CLS worse. I would also check desktop/mobile and anonymous/signed-in views, confirm that ad slots retain their space and load correctly, and check that test analytics records each expected event once. I would do this with staging/test integrations, then monitor field data after release. I would not delay all advertising, analytics or consent scripts without checking their dependencies.

## 4. Responsive CSS

Files: [HTML](q4/index.html), [CSS](q4/styles.css).

I used CSS Grid’s named areas to match the layouts. Desktop uses `a a b / c d e / f g h`. Mobile uses `a / d / b / c / g`, with E, F and H hidden using `display: none`. I chose 48rem as the breakpoint to leave enough room for three columns before switching to one. Rows grow with content; `minmax(0, 1fr)`, `min-width: 0` and wrapping prevent long headings from forcing overflow.

I kept one copy of each section and used no JavaScript. I prioritised the mobile reading order in the HTML: A, D, B, C, E, F, G, H. Screen readers and any future keyboard-focusable controls follow source order, not Grid positioning. This creates a desktop visual/reading-order difference. The sections are independent and noninteractive; if they became an ordered workflow, I would agree a consistent order with design rather than use positive tabindex values.

I included desktop/mobile screenshots and long-heading variants in `evidence/`. The browser checks also covered 320px and both sides of the 768px breakpoint. I have not carried out a screen-reader test.

## 5. Corrected HTML

File: [q5-q6/index.html](q5-q6/index.html), with the local `test.jpeg` image.

For HTML validity, I added the doctype, moved `</html>` after the body, replaced the unsupported `abbr name` attribute with `title`, corrected image `with` to `width`, used an integer HTML height instead of `auto`, supplied image alternative text and repaired the crossed `code`/`b` closing tags.

I also added a language declaration, a main landmark, charset, viewport and an explicit button type, and quoted the attributes consistently. The original unquoted URL/filename and whitespace in `</a >` are not automatically invalid HTML5. I retained the original button for Q6; “Add paragraphs” would be a clearer product label. I kept the code/bold example to demonstrate the nesting repair, although ordinary prose should not normally use `code`.

To improve discoverability and interpretation using HTML, I made these changes:

1. I replaced “Example” with a descriptive document title that identifies the page.
2. I added a truthful meta description to summarise the page and potentially supply a search snippet.
3. I used descriptive link text so the destination is clearly identified as Big Cabal Media.
4. I added alt text describing the illustration and used `lang` and `main` to clarify the language and primary content.

These changes improve interpretation; they do not guarantee higher search rankings. Both HTML pages passed validation with zero errors/warnings: `evidence/html-validation.txt`.

## 6. JavaScript

Implementation: [paragraphs.js](q5-q6/paragraphs.js).

I captured the three original paragraphs once so later clicks would not copy the growing collection. On each click, my script clones those originals, shuffles the new batch using Fisher–Yates and appends it. A random order may legitimately match the original. The paragraphs have no IDs, so cloning does not create duplicate IDs.

I used a refresh function to remove generated separators and insert an HR after each pair only when another paragraph follows. I included hidden paragraphs in that count, as required. This gives `P, P, HR, P` initially and avoids trailing or duplicate separators after repeated clicks.

I created the second button entirely in JavaScript. I used one boolean to store whether image paragraphs are hidden, and each refresh applies that state to both existing and new paragraphs. Native buttons support keyboard activation, and an output announces count/state.

Checks covered repeated clicks up to 18 paragraphs, hiding before adding, showing after adding, adding while shown, hiding again, exact separator placement, batch contents, controlled random permutations, keyboard operation and JavaScript-disabled content. See `evidence/browser-tests.txt`.

## 7. Readers see an older article

Assuming access to revisions, deployment history and delivery logs, I would make these three checks before recommending another release:

1. I would compare the saved/published revision and exact URL with affected and unaffected responses, ruling out previews, alternate URLs and unpublished changes.
2. I would compare response bodies and cache headers at the browser, edge and authorised origin/bypass paths. I would check anonymous/signed-in and relevant regional variants, since a hard refresh alone does not prove a CDN bypass.
3. I would compare origin release versions, database content, queries and logs. If the origin is current but the edge is stale, I would investigate cache invalidation. If the origin is stale too, I would check origin caches, queries, replica lag, deployment and publishing state.

If I confirmed stale cache, I would invalidate the affected URL and variants, then fix the invalidation behaviour. I would roll back if the release had caused a regression and the previous version was safe with the current data. I would not assume a theme rollback would fix stale content.

To verify recovery, I would check the corrected text under the previously failing conditions at both origin and edge, then check again after the cache warms up. I would also check rendering, ads, analytics and errors.

I would send the editor this update:

> I’m comparing the published revision with origin and cached responses to find why some readers are seeing the older text. I’ll update you in 15 minutes with the evidence and the safest fix, including whether a rollback or cache invalidation is needed.

## 8. Reduce editorial copying in one day

I would start by watching one editor prepare an article. I would ask which fields each destination needs, where changes originate, which errors happen most often and what must stay private before publication. I would note the time taken, the steps involved and any corrections needed.

If repeated field extraction was the main problem, I would add a small read-only “Copy publishing details” panel containing the saved title, public permalink, featured-image URL, alt text and credit. I would use saved values, warn about missing fields or unpublished content, restrict draft details to authorised editors and leave out temporary preview tokens. Editors would still control the wording, image choice, destinations, timing and publication approval.

I would also consider a shared copy template/checklist or an existing approved export feature. If inconsistent destination requirements were the main problem, I would choose that simpler option. With one day available, I would keep the scope small instead of building several API integrations.

I would pilot it with one editor using a draft, an updated title/image and missing image/credit details. I would check copied values, permissions and that nothing publishes automatically. Success would mean less time and fewer errors than the original workflow, with the editor willing to keep using it.

Personal example (75 words):

> In Outbreak Guard, I improved invitation acceptance for people belonging to multiple workspaces. I added explicit workspace selection, server-side eligibility checks and integration tests covering permissions, duplicate acceptance and concurrent connections. The resulting flow required a choice when several workspaces were eligible and connected only the selected workspace, keeping the user in control. I learned that reducing ambiguity can be more useful than adding automation, especially when an automatic choice could grant the wrong access.

## 9. Newsletter reliability

Function: [q9/signup.cjs](q9/signup.cjs).

I would store the email/list, consent reference, stable operation key, state, attempts and next-attempt time before acknowledging the signup. A durable queue would enforce signup uniqueness and lease jobs to prevent competing workers. I assume the provider honours the same idempotency key and payload throughout the retry window.

A timeout is an unknown outcome: the provider may already have accepted the signup. My function records the next retry time using backoff, jitter and Retry-After; a worker would call it again with the same key. Invalid email stops retries until corrected data creates a new operation. After eight transient failures, the job moves to review, which I would connect to an alert. Success saves the remote ID; a crash before that save is recoverable using the same key.

I would store email securely with limited retention and log job ID, attempt, outcome, timing and safe provider request IDs. I would exclude raw email, credentials, cookies and request/response bodies. The API adapter must enforce the timeout; storage, scheduling and alerts are assumed supporting services.

The local mock accepts the request and then throws a timeout. Retrying returns the same record: two calls, one subscriber. Ten mock tests passed, including rate limits, invalid email, persistence failure and crash recovery; see `evidence/newsletter-tests.txt`.

Without provider idempotency or documented unique-subscriber/upsert support, I would keep unknown outcomes pending for reconciliation rather than promise duplicate-free retries.

## 10. Security review

I would explain that hiding the button does not prevent direct requests. Assuming a same-site WordPress REST endpoint with cookie authentication, I would require these checks:

```text
1. Require POST, authenticated WordPress session and valid wp_rest nonce.
2. Validate a positive article ID and string status; reject extra fields.
   Allow only draft, pending, publish or private.
3. Load the post; reject missing, wrong-type, revision or trashed objects.
4. Require current_user_can('edit_post', id).
5. Enforce the editorial transition policy. For transitions into or out of
   publish/private, also require the post type's publish_posts capability.
6. Call wp_update_post with error reporting; handle WP_Error.
   Record actor, article, old/new status and time; return the saved status.
```

I would use a REST permission_callback and core update APIs. A nonce provides CSRF protection, not permission to edit. I would narrow the stated transition policy if the site required a separate approval step.

I would test two rejected requests: a subscriber with a valid nonce trying to publish another author's draft, and an otherwise authorised editor submitting without a valid nonce. Both should be rejected without changing the article. I would also check unsupported statuses, unauthorised article IDs and one permitted transition. These are proposed tests for the pseudocode; I have not implemented or tested a live endpoint.

I would raise the issue privately with the developer, show how a direct request bypasses the hidden button and work through the checks together. Before release, I would want authentication, CSRF protection, object-specific permissions and transition validation in place, with tests confirming that unauthorised requests cannot change an article.
