import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Live interactive clock pill displaying real-time date and time.
 * @param {{ showSeconds?: boolean, className?: string }} props
 */
export default function LiveClock({ showSeconds = false, className = '' }) {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, showSeconds ? 1000 : 5000);
    return () => clearInterval(timer);
  }, [showSeconds]);

  const dateStr = time.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const timeStr = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    ...(showSeconds ? { second: '2-digit' } : {}),
    hour12: true,
  });

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-muted px-2.5 py-1 text-xs font-semibold text-fg shadow-2xs whitespace-nowrap shrink-0",
        className
      )}
      title={`Live system time: ${time.toLocaleString()}`}
    >
      <span className="size-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
      <span>{dateStr}</span>
      <span className="text-muted" aria-hidden="true">·</span>
      <span className="font-mono text-[11px] tabular-nums text-muted">{timeStr}</span>
    </div>
  );
}

