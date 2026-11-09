import Card from '../../components/Card';
import Badge from '../../components/Badge';

export default function BootstrapChecklist({ bootstrap = {} }) {
  const items = [
    {
      key: 'mysql',
      name: 'XAMPP MySQL / MariaDB',
      present: Boolean(bootstrap.mysql),
      desc: 'Local MySQL running on port 3306 (XAMPP Control Panel) for local data persistence.',
    },
    {
      key: 'adminUidsSet',
      name: 'ADMIN_UIDS',
      present: Boolean(bootstrap.adminUidsSet),
      desc: 'Comma-separated account IDs for protected bootstrap administrators.',
    },
    {
      key: 'jwtSecretSet',
      name: 'JWT_SECRET',
      present: Boolean(bootstrap.jwtSecretSet),
      desc: 'Unique server-side signing secret of at least 32 characters.',
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
          Bootstrap variables are critical host environment variables set in .env / .env.local.
          Values are never rendered or returned over the wire.
        </p>
      </div>

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

      <div className="mt-5 rounded-xl border border-line bg-surface p-4 text-xs text-fg space-y-3">
        <div className="font-semibold text-fg">Local Setup Reference &amp; Instructions:</div>
        <ol className="list-decimal space-y-2 pl-4 text-muted text-[11px]">
          <li>
            <strong>XAMPP MySQL:</strong> Open the XAMPP Control Panel and ensure the <strong>MySQL</strong> module is started (port 3306).
          </li>
          <li>
            <strong>Database Schema:</strong> ChopWise automatically bootstraps the <code>chopwise</code> database and tables on startup (or you can run <code>mysql/schema.sql</code> in phpMyAdmin).
          </li>
          <li>
            <strong>Admin Access:</strong> Register your account, then add its account ID to <code>ADMIN_UIDS</code> in the server environment.
          </li>
          <li>
            <strong>JWT_SECRET:</strong> Configure a unique random signing secret of at least 32 characters on the server.
          </li>
          <li>
            <strong>API Keys:</strong> You can configure Gemini and Edamam keys directly from the Integration Cards below.
          </li>
        </ol>
      </div>
    </Card>
  );
}
