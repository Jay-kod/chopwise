import Card from '../../components/Card';
import { Skeleton } from '@/components/ui/skeleton';

function AdminCardSkeleton({ titleWidth = 'w-48', subtitleWidth = 'w-72', children }) {
  return (
    <Card className="p-6 space-y-4 shadow-sm border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="space-y-1.5">
          <Skeleton className={`h-5 ${titleWidth} rounded-md`} />
          <Skeleton className={`h-3.5 ${subtitleWidth} rounded-md`} />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      {children}
    </Card>
  );
}

function FunctionsTableSkeleton() {
  return (
    <AdminCardSkeleton titleWidth="w-56" subtitleWidth="w-80">
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-line last:border-0">
            <div className="flex items-center gap-3">
              <Skeleton className="size-5 rounded-md" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-40 rounded-md" />
                <Skeleton className="h-3 w-28 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </AdminCardSkeleton>
  );
}

function IntegrationCardSkeleton() {
  return (
    <Card className="p-6 space-y-4 shadow-sm border border-line bg-surface">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-8 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-3 w-40 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-20 rounded-md" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-line">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </Card>
  );
}

/**
 * High-fidelity Skeleton loader for ChopWise Admin Dashboard.
 * Replaces bare spinners with realistic layout skeletons while config status loads.
 */
export default function AdminSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Admin Top Header Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
          <Skeleton className="h-7 w-64 rounded-md" />
          <Skeleton className="h-3.5 w-96 max-w-full rounded-md" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Section A: Functions Table */}
      <section>
        <FunctionsTableSkeleton />
      </section>

      {/* Section B: Integration Cards */}
      <section className="space-y-3">
        <Skeleton className="h-6 w-36 rounded-md" />
        <div className="grid gap-6 lg:grid-cols-2">
          <IntegrationCardSkeleton />
          <IntegrationCardSkeleton />
        </div>
      </section>

      {/* Section C: Settings & Safety Thresholds */}
      <section className="grid gap-6 lg:grid-cols-2">
        <AdminCardSkeleton titleWidth="w-48" subtitleWidth="w-64">
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-32 rounded-md" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-40 rounded-md" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          </div>
        </AdminCardSkeleton>
        <AdminCardSkeleton titleWidth="w-44" subtitleWidth="w-60">
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-36 rounded-md" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28 rounded-md" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          </div>
        </AdminCardSkeleton>
      </section>

      {/* Section D: Price Table Editor */}
      <section>
        <AdminCardSkeleton titleWidth="w-52" subtitleWidth="w-80">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-line last:border-0">
                <Skeleton className="h-4 w-44 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            ))}
          </div>
        </AdminCardSkeleton>
      </section>
    </div>
  );
}
