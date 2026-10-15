'use strict';

const container = document.querySelector('#paragraphs');
// Capture pristine originals once: later clicks never copy previous batches or HRs.
const originals = Array.from(container.children, (paragraph) => paragraph.cloneNode(true));
let imagesHidden = false;
const toggle = document.createElement('button');
toggle.type = 'button';
toggle.id = 'toggle-images';
toggle.textContent = 'Hide image paragraphs';
toggle.setAttribute('aria-controls', 'paragraphs');
toggle.setAttribute('aria-pressed', 'false');
document.querySelector('#controls').append(toggle);

function refresh() {
  container.querySelectorAll('hr[data-separator]').forEach((hr) => hr.remove());
  const paragraphs = Array.from(container.children).filter((node) => node.tagName === 'P');
  paragraphs.forEach((paragraph, index) => {
    paragraph.hidden = imagesHidden && paragraph.querySelector('img') !== null;
    // Hidden paragraphs count. Do not create an HR after the final paragraph.
    if ((index + 1) % 2 === 0 && index < paragraphs.length - 1) {
      const hr = document.createElement('hr');
      hr.dataset.separator = '';
      paragraph.after(hr);
    }
  });
  document.querySelector('#status').textContent = `${paragraphs.length} paragraphs; image paragraphs ${imagesHidden ? 'hidden' : 'shown'}.`;
}

document.querySelector('#add-paragraphs').addEventListener('click', () => {
  const batch = originals.map((paragraph) => paragraph.cloneNode(true));
  // Fisher–Yates: each permutation is equally likely for a uniform random source.
  for (let i = batch.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [batch[i], batch[j]] = [batch[j], batch[i]];
  }
  container.append(...batch);
  refresh();
});

toggle.addEventListener('click', () => {
  imagesHidden = !imagesHidden;
  toggle.setAttribute('aria-pressed', String(imagesHidden));
  toggle.textContent = imagesHidden ? 'Show image paragraphs' : 'Hide image paragraphs';
  refresh();
});
refresh();
