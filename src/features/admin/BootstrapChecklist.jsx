import Card from '../../components/Card';
import Badge from '../../components/Badge';

export default function BootstrapChecklist({ bootstrap = {} }) {
  const items = [
    {
      key: 'firebaseAdmin',
      name: 'FIREBASE_SERVICE_ACCOUNT_B64',
      present: Boolean(bootstrap.firebaseAdmin),
      desc: 'Base64-encoded Firebase Admin service account key JSON for server operations.',
    },
    {
      key: 'adminUidsSet',
      name: 'ADMIN_UIDS',
      present: Boolean(bootstrap.adminUidsSet),
      desc: 'Comma-separated list of Firebase user UIDs authorized to access this /admin portal.',
    },
    {
      key: 'encryptionKeySet',
      name: 'CONFIG_ENCRYPTION_KEY',
      present: Boolean(bootstrap.encryptionKeySet),
      desc: '32-byte base64 key used for AES-256-GCM encryption of integration credentials at rest.',
    },
  ];

  const allReady = items.every((i) => i.present);

  return (
    <Card className="p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-fg">Bootstrap Environment Checklist</h2>
          <Badge variant={allReady ? 'ok' : 'warning'}>
            {allReady ? 'All set' : 'Action required'}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted">
          Bootstrap variables are critical host environment variables set in .env.local and Vercel.
          Values are never rendered or returned over the wire.
        </p>
      </div>

      {/* Status items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex flex-col gap-1 rounded-xl border border-line bg-surface-muted p-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="font-mono text-xs font-bold text-fg">{item.name}</div>
              <div className="text-[11px] text-muted">{item.desc}</div>
            </div>
            <div>
              <Badge variant={item.present ? 'ok' : 'warning'}>
                {item.present ? 'Configured' : 'Missing'}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Guide & Setup steps */}
      <div className="mt-5 rounded-xl border border-line bg-surface p-4 text-xs text-fg space-y-3">
        <div className="font-semibold text-fg">Bootstrap Setup Reference & Links:</div>

        <div className="flex flex-wrap gap-3">
          <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary-hover font-medium"
          >
            Firebase Console ↗
          </a>
          <a
            href="https://firebase.google.com/docs/web/setup"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary-hover font-medium"
          >
            Web App Setup ↗
          </a>
          <a
            href="https://firebase.google.com/docs/admin/setup"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary-hover font-medium"
          >
            Admin SDK Setup ↗
          </a>
          <a
            href="https://vercel.com/docs/environment-variables"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary-hover font-medium"
          >
            Vercel Env Variables ↗
          </a>
        </div>

        <ol className="list-decimal space-y-2 pl-4 text-muted text-[11px]">
          <li>
            <strong>Firebase Project:</strong> Create a project, enable Email/Password auth, and deploy
            Firestore in production mode with the rules in <code>firestore.rules</code>.
          </li>
          <li>
            <strong>Service Account:</strong> Go to Project Settings &gt; Service accounts &gt; Generate new
            private key. Base64-encode it:
            <pre className="mt-1 rounded bg-surface-muted p-2 font-mono text-[10px] text-fg overflow-x-auto">
              [Convert]::ToBase64String([IO.File]::ReadAllBytes("key.json"))
            </pre>
            Save as <code>FIREBASE_SERVICE_ACCOUNT_B64</code> and delete the raw JSON file.
          </li>
          <li>
            <strong>Encryption Key:</strong> Generate a 32-byte key:
            <pre className="mt-1 rounded bg-surface-muted p-2 font-mono text-[10px] text-fg overflow-x-auto">
              node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
            </pre>
            Save as <code>CONFIG_ENCRYPTION_KEY</code> in <code>.env.local</code> and Vercel.
          </li>
          <li>
            <strong>Admin UIDs:</strong> Register your user in the app, find their UID in Firebase Auth, and set
            <code>ADMIN_UIDS=&lt;your-uid&gt;</code>.
          </li>
        </ol>
      </div>
    </Card>
  );
}

