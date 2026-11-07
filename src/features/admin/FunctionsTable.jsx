import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';

export default function FunctionsTable({ functions = [], onTest, onTestAll, testingTarget }) {
  const isTestingAny = Boolean(testingTarget);

  function getBadgeVariant(status) {
    switch (status) {
      case 'ok':
        return 'ok';
      case 'failing':
        return 'error';
      case 'untested':
        return 'warning';
      case 'not_configured':
      default:
        return 'neutral';
    }
  }

  function formatTime(isoStr) {
    if (!isoStr) return 'Never tested';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString();
    } catch {
      return isoStr;
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-fg">Functions & APIs</h2>
          <p className="text-xs text-muted">
            Live status of external APIs, pipelines, and server integrations.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => onTestAll()}
          disabled={isTestingAny}
          className="text-xs min-h-9 px-3"
        >
          {isTestingAny ? <Spinner label="Testing…" /> : '⚡ Test all'}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-fg">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="pb-2 font-medium">Service / Function</th>
              <th className="pb-2 font-medium">Type</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Last Test Result</th>
              <th className="pb-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {functions.map((fn) => {
              const isRunning = testingTarget === fn.testTarget;
              return (
                <tr key={fn.id} className="hover:bg-surface-muted">
                  <td className="py-3 font-medium">
                    <div>{fn.title}</div>
                    <a
                      href={`#integration-${fn.id}`}
                      className="text-[11px] text-primary underline hover:text-primary-hover"
                    >
                      Setup guide ↓
                    </a>
                  </td>
                  <td className="py-3 capitalize text-muted">{fn.kind}</td>
                  <td className="py-3">
                    <Badge variant={getBadgeVariant(fn.status)}>
                      {fn.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 text-muted">
                    {fn.lastTest ? (
                      <div>
                        <div className={fn.lastTest.ok ? 'text-fg' : 'text-danger-fg'}>
                          {fn.lastTest.message}
                          {fn.lastTest.latencyMs != null && (
                            <span className="ml-1 opacity-70">({fn.lastTest.latencyMs} ms)</span>
                          )}
                        </div>
                        <div className="text-[10px] opacity-70">
                          {formatTime(fn.lastTest.testedAt)}
                        </div>
                      </div>
                    ) : (
                      'Untested'
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      variant="secondary"
                      onClick={() => onTest(fn.testTarget)}
                      disabled={isTestingAny}
                      className="text-xs min-h-8 px-2.5"
                    >
                      {isRunning ? <Spinner label="Testing…" /> : 'Test'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
