import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import MealCardSkeleton from '@/features/meals/MealCardSkeleton';

function StatSkeletonCard() {
  return (
    <Card className="shadow-none border border-line bg-surface p-4">
      <CardHeader className="p-0 pb-2">
        <Skeleton className="h-3.5 w-24 rounded-md" />
      </CardHeader>
      <CardContent className="p-0 flex flex-col gap-2">
        <Skeleton className="h-7 w-28 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-3.5 w-20 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSkeletonCard({ className = '', height = 'h-56' }) {
  return (
    <Card className={`shadow-none border border-line bg-surface p-4 ${className}`}>
      <div className="flex items-center justify-between pb-3">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-3 w-48 rounded-md" />
        </div>
        <Skeleton className="h-6 w-20 rounded-md" />
      </div>
      <Skeleton className={`w-full ${height} rounded-lg`} />
    </Card>
  );
}

function TableSkeletonCard({ className = '' }) {
  return (
    <Card className={`shadow-none border border-line bg-surface p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between pb-1">
        <div className="space-y-1">
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-3 w-40 rounded-md" />
        </div>
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-line last:border-0">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-7 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-2.5 w-16 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function FilterBarSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-3.5 w-16 rounded-md" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16 rounded-md" />
          <div className="flex gap-1.5">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-18 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Complete, responsive User Dashboard skeleton placeholder.
 * Replaces jarring blank screens or spinners with high-fidelity animated placeholders.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Heading & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-72 rounded-md" />
          <Skeleton className="h-3.5 w-96 max-w-full rounded-md" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* Analytics & Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatSkeletonCard />
        <StatSkeletonCard />
        <StatSkeletonCard />
        <StatSkeletonCard />
        <ChartSkeletonCard className="sm:col-span-2 lg:col-span-2" height="h-60" />
        <ChartSkeletonCard className="sm:col-span-2 lg:col-span-2" height="h-60" />
        <ChartSkeletonCard className="sm:col-span-2 lg:col-span-2" height="h-52" />
        <ChartSkeletonCard className="sm:col-span-2 lg:col-span-2" height="h-52" />
        <TableSkeletonCard className="sm:col-span-2" />
        <TableSkeletonCard className="sm:col-span-2" />
      </div>

      {/* Recommended Meals Section */}
      <section className="space-y-4 pt-4 border-t border-line">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-64 rounded-md" />
          <Skeleton className="h-3.5 w-80 max-w-full rounded-md" />
        </div>

        <FilterBarSkeleton />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <MealCardSkeleton key={idx} />
          ))}
        </div>
      </section>
    </div>
  );
}
export default DashboardSkeleton;
