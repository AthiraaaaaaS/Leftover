import { cn } from "@/lib/utils";

export function GradientHeader({
  title,
  subtitle,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold tracking-tight">{title}</div>
          {subtitle ? (
            <div className="text-sm text-muted-foreground">{subtitle}</div>
          ) : null}
        </div>
        {right}
      </div>
    </div>
  );
}
