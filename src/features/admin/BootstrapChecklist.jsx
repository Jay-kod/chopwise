import Card from '../../components/Card';
import Badge from '../../components/Badge';

export default function BootstrapChecklist({ bootstrap = {} }) {
  const items = [
    {
      key: 'supabaseAdmin',
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      present: Boolean(bootstrap.supabaseAdmin),
      desc: 'Service role secret key from Supabase Project Settings > API for serverless operations.',
    },
    {
      key: 'adminUidsSet',
      name: 'ADMIN_UIDS',
      present: Boolean(bootstrap.adminUidsSet),
      desc: 'Comma-separated list of user UUIDs authorized to access this /admin portal.',
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
        <div className="font-semibold text-fg">Bootstrap Setup Reference &amp; Links:</div>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary-hover font-medium"
          >
            Supabase Dashboard ↗
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
            <strong>Database Schema:</strong> Run the SQL script from <code>supabase/schema.sql</code> in your
            Supabase Project SQL Editor to create tables and Row Level Security (RLS) policies.
          </li>
          <li>
            <strong>API Credentials:</strong> In Supabase Dashboard &gt; Project Settings &gt; API, copy the
            Project URL and <code>anon</code> public key into <code>.env.local</code> as <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
          </li>
          <li>
            <strong>Service Role Key:</strong> Copy the <code>service_role</code> secret into <code>.env.local</code> as <code>SUPABASE_SERVICE_ROLE_KEY</code>.
          </li>
          <li>
            <strong>Admin Access:</strong> Register in ChopWise, copy your user UUID from Supabase Auth &gt; Users,
            and set <code>ADMIN_UIDS=&lt;your-uuid&gt;</code> in <code>.env.local</code>.
          </li>
        </ol>
      </div>
    </Card>
  );
}
