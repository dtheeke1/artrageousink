// ─────────────────────────────────────────────────────────────
//  Shared utilities used across all pages
// ─────────────────────────────────────────────────────────────

// ── Spinner ──────────────────────────────────────────────────
function showSpinner(el, msg = 'Loading…') {
  el.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div><p class="spinner-msg">${msg}</p></div>`;
}

// ── Error display ─────────────────────────────────────────────
function showError(el, msg) {
  el.innerHTML = `<div class="error-box"><p>${msg}</p></div>`;
}

// ── Format a date string from Google Photos ───────────────────
function fmtDate(creationTime) {
  if (!creationTime) return '';
  const d = new Date(creationTime);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtYear(creationTime) {
  if (!creationTime) return '';
  return new Date(creationTime).getFullYear();
}

// ── Shuffle array (Fisher-Yates) ──────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Chunk array ───────────────────────────────────────────────
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ── Session-cached API calls ──────────────────────────────────
async function cachedAlbums(token) {
  const key = 'cache_albums';
  const cached = sessionStorage.getItem(key);
  if (cached) return JSON.parse(cached);
  const albums = await API.albums(token);
  sessionStorage.setItem(key, JSON.stringify(albums));
  return albums;
}

// ── Detect if album title matches a person name ───────────────
function isPeopleAlbum(title) {
  if (!title) return false;
  const t = title.toLowerCase();
  return CONFIG.PEOPLE.some(name => {
    const n = name.toLowerCase();
    return t === n || t.startsWith(n + ' ') || t.endsWith(' ' + n) || t.includes(' ' + n + ' ');
  });
}

// ── Build a photo grid ────────────────────────────────────────
function buildGrid(photos, container, onClick) {
  if (!photos.length) {
    container.innerHTML = '<p class="empty">No photos found.</p>';
    return;
  }
  container.innerHTML = photos.map((p, i) =>
    `<div class="grid-item" data-index="${i}" title="${p.filename || ''}">
       <img src="${API.url(p.baseUrl, 'thumb')}" alt="" loading="lazy">
       <div class="grid-overlay">
         <span>${fmtDate(p.mediaMetadata?.creationTime)}</span>
       </div>
     </div>`
  ).join('');
  container.querySelectorAll('.grid-item').forEach(el =>
    el.addEventListener('click', () => onClick(+el.dataset.index))
  );
}

// ── Collage layouts (CSS Grid template areas) ─────────────────
const COLLAGE_LAYOUTS = [
  // 6-photo mosaic: one big + 4 small
  {
    count: 5,
    areas: `"a a b c" "a a d e"`,
    cells: ['a','b','c','d','e'],
    cols: '2fr 1fr 1fr',
    rows: '1fr 1fr',
  },
  // 4-photo quad
  {
    count: 4,
    areas: `"a b" "c d"`,
    cells: ['a','b','c','d'],
    cols: '1fr 1fr',
    rows: '1fr 1fr',
  },
  // 3-photo: wide + two stacked
  {
    count: 3,
    areas: `"a b" "a c"`,
    cells: ['a','b','c'],
    cols: '2fr 1fr',
    rows: '1fr 1fr',
  },
  // 7-photo magazine
  {
    count: 7,
    areas: `"a a b c" "a a d e" "f f g g"`,
    cells: ['a','b','c','d','e','f','g'],
    cols: '2fr 1fr 1fr',
    rows: '1fr 1fr 1fr',
  },
];

function buildCollage(photos, container) {
  if (!photos.length) {
    container.innerHTML = '<p class="empty">Select an album to build a collage.</p>';
    return;
  }
  const shuffled = shuffle(photos);
  const layout = COLLAGE_LAYOUTS.find(l => l.count <= shuffled.length)
    || COLLAGE_LAYOUTS[1];
  const slice = shuffled.slice(0, layout.count);

  container.innerHTML = `
    <div class="collage-grid"
         style="grid-template-areas:${layout.areas}; grid-template-columns:${layout.cols}; grid-template-rows:${layout.rows};">
      ${slice.map((p, i) => `
        <div class="collage-cell" style="grid-area:${layout.cells[i]};">
          <img src="${API.url(p.baseUrl, 'medium')}" alt="" loading="lazy">
        </div>`).join('')}
    </div>`;
}

// ── Lightbox ──────────────────────────────────────────────────
const Lightbox = (() => {
  let photos = [];
  let idx = 0;

  function open(list, startIdx) {
    photos = list;
    idx = startIdx;
    document.getElementById('lb').classList.add('open');
    render();
  }

  function close() {
    document.getElementById('lb').classList.remove('open');
  }

  function render() {
    const p = photos[idx];
    const isVideo = p.mediaMetadata?.video != null;
    const el = document.getElementById('lb-media');
    el.innerHTML = isVideo
      ? `<video src="${API.videoUrl(p.baseUrl)}" controls autoplay></video>`
      : `<img src="${API.url(p.baseUrl, 'full')}" alt="">`;
    document.getElementById('lb-date').textContent = fmtDate(p.mediaMetadata?.creationTime);
    document.getElementById('lb-count').textContent = `${idx + 1} / ${photos.length}`;
  }

  function prev() { idx = (idx - 1 + photos.length) % photos.length; render(); }
  function next() { idx = (idx + 1) % photos.length; render(); }

  document.addEventListener('keydown', e => {
    if (!document.getElementById('lb')?.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape') close();
  });

  return { open, close, prev, next };
})();

// ── Auth error recovery ───────────────────────────────────────
function handleAuthError(err) {
  if (err?.message === 'AUTH_EXPIRED' || err === 'AUTH_EXPIRED') {
    Auth.clearToken?.();
    sessionStorage.clear();
    window.location.href = 'index.html?expired=1';
  }
}

// ── Nav active link ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href === path || (path === '' && href === 'index.html'))) {
      a.classList.add('active');
    }
  });

  document.getElementById('hamburger')?.addEventListener('click', () => {
    document.getElementById('nav-links').classList.toggle('open');
  });

  document.getElementById('signout-btn')?.addEventListener('click', () => {
    Auth.signOut();
    sessionStorage.clear();
    window.location.href = 'index.html';
  });
});
