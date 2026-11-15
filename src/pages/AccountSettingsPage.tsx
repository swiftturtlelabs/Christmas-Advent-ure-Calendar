import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createOrResetApiKey, hasApiKey, revokeApiKey } from '../lib/apiKeyService';

export function AccountSettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const apiEnabled = hasApiKey(profile);

  const handleGenerate = async () => {
    if (!user) return;
    const confirmReset = apiEnabled
    ? window.confirm('Reset your API key? The old key stops working immediately.')
    : true;
    if (!confirmReset) return;

    setBusy(true);
    setError('');
    setNewKey(null);
    setCopied(false);
    try {
      const key = await createOrResetApiKey(user.uid);
      await refreshProfile();
      setNewKey(key);
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Unknown error';
      setError(detail);
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async () => {
    if (!user || !apiEnabled) return;
    if (!window.confirm('Turn off API access and delete your key?')) return;

    setBusy(true);
    setError('');
    setNewKey(null);
    try {
      await revokeApiKey(user.uid);
      await refreshProfile();
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Unknown error';
      setError(detail);
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!newKey) return;
    try {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
    } catch {
      setError('Could not copy to clipboard.');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="page account-settings-page">
      <p>
        <Link to="/app">← Back to My Calendars</Link>
      </p>
      <h1>Account</h1>
      <p className="muted">
        Signed in as <strong>{profile?.displayName || user.displayName || 'Creator'}</strong>
        {profile?.email ? ` (${profile.email})` : ''}
      </p>

      <section className="card account-section" aria-labelledby="api-access-heading">
        <h2 id="api-access-heading">API access</h2>
        <p className="muted">
          Create an API key so tools like ChatGPT or scripts can list calendars, create new ones, and
          update daily activities. Keep your key secret.
        </p>
        <p>
          Status:{' '}
          <strong>{apiEnabled ? `Enabled (${profile?.apiKeyPrefix})` : 'Off'}</strong>
          {profile?.apiKeyCreatedAt && apiEnabled && (
            <span className="muted"> — created {new Date(profile.apiKeyCreatedAt).toLocaleDateString()}</span>
          )}
        </p>

        {newKey && (
          <div className="api-key-reveal" role="status">
            <strong>Copy your new key now</strong>
            <span className="muted"> — you won&apos;t see it again.</span>
            <code>{newKey}</code>
            <div className="api-key-display">
              <button type="button" className="btn secondary" onClick={handleCopy}>
                {copied ? 'Copied' : 'Copy key'}
              </button>
            </div>
          </div>
        )}

        {error && <p className="error">{error}</p>}

        <div className="api-key-display">
          <button type="button" className="btn primary" onClick={handleGenerate} disabled={busy}>
            {busy ? 'Working…' : apiEnabled ? 'Reset API key' : 'Generate API key'}
          </button>
          {apiEnabled && (
            <button type="button" className="btn danger" onClick={handleRevoke} disabled={busy}>
              Turn off API
            </button>
          )}
        </div>

        <p className="muted" style={{ marginTop: '1rem' }}>
          See <Link to="/app/api-docs">API documentation</Link> for endpoints and example AI prompts.
        </p>
      </section>
    </div>
  );
}