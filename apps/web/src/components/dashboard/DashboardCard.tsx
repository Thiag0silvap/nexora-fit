type DashboardCardProps = {
  label: string;
  value: string;
  helper: string;
};

export function DashboardCard({ label, value, helper }: DashboardCardProps) {
  return (
    <article className="dashboard-card">
      <div className="dashboard-card-top">
        <span>{label}</span>
        <div className="card-glow-dot" />
      </div>
      <strong>{value}</strong>
      <p>{helper}</p>
    </article>
  );
}
