interface DashboardHeroProps {
  title: string;
  description?: string;
}

export function DashboardHero({ title, description }: DashboardHeroProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
    </div>
  );
}
