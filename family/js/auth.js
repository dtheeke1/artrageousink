// ─────────────────────────────────────────────────────────────
//  Google OAuth — client-side token management
//  Uses Google Identity Services (no backend needed)
// ─────────────────────────────────────────────────────────────
const Auth = (() => {
  const SCOPES = 'https://www.googleapis.com/auth/photoslibrary.readonly';
  const KEY = 'gp_token';
  let tokenClient = null;

  function getToken() {
    return sessionStorage.getItem(KEY);
  }

  function saveToken(t) {
    sessionStorage.setItem(KEY, t);
  }

  function clearToken() {
    sessionStorage.removeItem(KEY);
  }

  function isConnected() {
    return !!getToken();
  }

  // Initialize the token client (call after GSI script loads)
  function init(onSuccess, onError) {
    if (!CONFIG.CLIENT_ID || CONFIG.CLIENT_ID.startsWith('YOUR_')) {
      onError && onError('not_configured');
      return;
    }
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CONFIG.CLIENT_ID,
      scope: SCOPES,
      callback: (resp) => {
        if (resp.error) { onError && onError(resp.error); return; }
        saveToken(resp.access_token);
        onSuccess && onSuccess(resp.access_token);
      },
    });
  }

  // Prompt the user to sign in / grant access
  function connect(onSuccess, onError) {
    if (!tokenClient) { init(onSuccess, onError); }
    tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  // Silent refresh (if user already granted previously in this session)
  function silentConnect(onSuccess, onError) {
    if (!tokenClient) { init(onSuccess, onError); }
    tokenClient.requestAccessToken({ prompt: '' });
  }

  function signOut() {
    const token = getToken();
    if (token) google.accounts.oauth2.revoke(token);
    clearToken();
  }

  return { init, connect, silentConnect, signOut, isConnected, getToken };
})();
