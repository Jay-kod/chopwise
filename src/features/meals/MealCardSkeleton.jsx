import Card from '../../components/Card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loader matching the layout, dimensions and spacing of MealCard.
 * Adheres to AGENTS.md rules: functions <= 40 lines, semantic tokens only.
 */
export default function MealCardSkeleton() {
  return (
    <Card className="h-full flex flex-col justify-between shadow-sm p-4 space-y-4">
      <div className="space-y-3">
        {/* Header row: Meal type & Prep time */}
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>

        {/* Title and Cost */}
        <div className="mt-2 flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-3/5 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>

        {/* Short description (3 lines) */}
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-3 w-full rounded-sm" />
          <Skeleton className="h-3 w-5/6 rounded-sm" />
          <Skeleton className="h-3 w-2/3 rounded-sm" />
        </div>
      </div>

      {/* Badges & Tags Footer */}
      <div className="space-y-2 border-t border-line pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>
        <div className="flex flex-wrap items-center gap-1 pt-1">
          <Skeleton className="h-4 w-14 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
      </div>
    </Card>
  );
}
