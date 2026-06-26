// ─────────────────────────────────────────────────────────────
//  Google Photos Library API wrapper
// ─────────────────────────────────────────────────────────────
const API = (() => {
  const BASE = 'https://photoslibrary.googleapis.com/v1';

  async function req(token, path, opts = {}) {
    const url = path.startsWith('http') ? path : `${BASE}${path}`;
    const headers = { Authorization: `Bearer ${token}`, ...opts.headers };
    const r = await fetch(url, { ...opts, headers });
    if (!r.ok) {
      if (r.status === 401) throw new Error('AUTH_EXPIRED');
      throw new Error(`API error ${r.status}`);
    }
    return r.json();
  }

  // Paginated helper — walks all pages and returns combined array
  async function paginate(token, path, field, body = null) {
    const items = [];
    let pageToken = null;
    do {
      const qs = pageToken ? `${path.includes('?') ? '&' : '?'}pageToken=${pageToken}` : '';
      const opts = body
        ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, pageToken }) }
        : {};
      const data = await req(token, `${path}${qs}`, opts);
      if (data[field]) items.push(...data[field]);
      pageToken = data.nextPageToken || null;
    } while (pageToken);
    return items;
  }

  return {
    // All user albums (Google Photos auto-creates event albums)
    async albums(token) {
      return paginate(token, '/albums?pageSize=50', 'albums');
    },

    // Shared albums the user has access to
    async sharedAlbums(token) {
      return paginate(token, '/sharedAlbums?pageSize=50', 'sharedAlbums');
    },

    // Join a shared album by its shareToken (extracted from share URL)
    async joinSharedAlbum(token, shareToken) {
      return req(token, '/sharedAlbums:join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareToken }),
      });
    },

    // Photos inside one album
    async photosInAlbum(token, albumId) {
      return paginate(token, '/mediaItems:search', 'mediaItems', { albumId, pageSize: 100 });
    },

    // Most recent photos across the whole library
    async recent(token, count = 60) {
      return paginate(token, `/mediaItems?pageSize=${Math.min(count, 100)}`, 'mediaItems');
    },

    // Photos filtered by content category (e.g. 'PEOPLE', 'SELFIES', 'HOLIDAYS')
    async byCategory(token, category) {
      return paginate(token, '/mediaItems:search', 'mediaItems', {
        pageSize: 100,
        filters: { contentFilter: { includedContentCategories: [category] } },
      });
    },

    // Build a display URL from a Google Photos baseUrl
    // size: 'thumb' | 'medium' | 'full'
    url(baseUrl, size = 'medium') {
      const params = { thumb: '=w400-h400-c', medium: '=w1200-h1200', full: '=w2560-h2560' };
      return `${baseUrl}${params[size] || params.medium}`;
    },

    // Video URL
    videoUrl(baseUrl) {
      return `${baseUrl}=dv`;
    },
  };
})();
