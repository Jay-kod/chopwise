export default function AdminPageHeader({ title, description, badge, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-fg">{title}</h1>
          {badge && (
            <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-primary">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-muted max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
