import EvaluationRunner from '@/features/admin/EvaluationRunner';
import AdminPageHeader from './AdminPageHeader';

export default function AdminEvaluation() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Evaluation Suite"
        description="Run automated recipe evaluation scenarios across test Nigerian personas (Chapter 4 thesis evidence)."
      />

      <EvaluationRunner />
    </div>
  );
}
