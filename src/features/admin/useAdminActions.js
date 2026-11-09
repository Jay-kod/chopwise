import { useCallback, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

export function useAdminActions() {
  const [pendingAction, setPendingAction] = useState('');
  const [error, setError] = useState('');

  const run = useCallback(async (action, payload = {}) => {
    setPendingAction(action);
    setError('');
    try {
      return await apiClient('/api/admin', { action, ...payload });
    } catch (requestError) {
      setError(requestError.message || `The ${action} action failed.`);
      return null;
    } finally {
      setPendingAction('');
    }
  }, []);

  return { pendingAction, error, setError, run };
}
