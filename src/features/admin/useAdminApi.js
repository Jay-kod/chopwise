import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';
import { useToast } from '../../components/Toast';

export function useAdminApi() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testingTarget, setTestingTarget] = useState(null);
  const addToast = useToast();

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient('/api/admin', { action: 'status' });
      setStatus(data);
      return data;
    } catch (err) {
      const msg = err.message || 'Failed to load admin status.';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const saveSection = useCallback(
    async (section, values) => {
      try {
        await apiClient('/api/admin', {
          action: 'saveConfig',
          section,
          values,
        });
        addToast(`Successfully saved ${section} configuration.`, 'ok');
        await fetchStatus();
        return { ok: true };
      } catch (err) {
        const msg = err.message || `Failed to save ${section}.`;
        addToast(msg, 'error');
        return { ok: false, error: err };
      }
    },
    [fetchStatus, addToast]
  );

  const resetConfigSection = useCallback(
    async (section) => {
      try {
        await apiClient('/api/admin', {
          action: 'resetSection',
          section,
        });
        addToast(`Reset ${section} to default values.`, 'ok');
        await fetchStatus();
        return { ok: true };
      } catch (err) {
        const msg = err.message || `Failed to reset ${section}.`;
        addToast(msg, 'error');
        return { ok: false, error: err };
      }
    },
    [fetchStatus, addToast]
  );

  const runTest = useCallback(
    async (target, values = null) => {
      try {
        setTestingTarget(target);
        const payload = {
          action: 'test',
          target,
        };
        if (values && typeof values === 'object') {
          payload.values = values;
        }

        const result = await apiClient('/api/admin', payload);
        const formatted = {
          ...result,
          testedAt: result.testedAt || new Date().toISOString(),
        };

        if (formatted.ok) {
          addToast(`Test passed for ${target}: ${formatted.message}`, 'ok');
        } else {
          addToast(`Test failed for ${target}: ${formatted.message}`, 'error');
        }

        // Background sync to update status cache
        fetchStatus().catch(() => {});
        return formatted;
      } catch (err) {
        const msg = err.message || `Test failed for ${target}.`;
        addToast(msg, 'error');
        return { ok: false, message: msg, testedAt: new Date().toISOString() };
      } finally {
        setTestingTarget(null);
      }
    },
    [fetchStatus, addToast]
  );

  const testAll = useCallback(
    async (targets) => {
      const targetList =
        targets ||
        status?.functions?.map((f) => f.testTarget).filter(Boolean) ||
        [];

      let allPassed = true;
      for (const target of targetList) {
        const res = await runTest(target);
        if (!res?.ok) allPassed = false;
      }

      await fetchStatus();

      if (allPassed) {
        addToast('All healthcheck tests passed successfully!', 'ok');
      }
    },
    [status, runTest, fetchStatus, addToast]
  );

  return {
    status,
    loading,
    error,
    testingTarget,
    fetchStatus,
    saveSection,
    resetConfigSection,
    runTest,
    testAll,
  };
}

