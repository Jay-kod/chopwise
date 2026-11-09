import { useOutletContext } from 'react-router-dom';

/**
 * Access shared admin state and actions provided by AdminLayout.
 * @returns {import('../../features/admin/useAdminApi').AdminApiState}
 */
export function useAdminContext() {
  return useOutletContext();
}
