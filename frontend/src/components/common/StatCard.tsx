interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: 'amber' | 'green' | 'blue' | 'purple' | 'red' | 'orange';
  sub?: string;
}

const colorMap: Record<string, string> = {
  amber:  '#f59e0b',
  green:  '#10b981',
  blue:   '#3b82f6',
  purple: '#8b5cf6',
  red:    '#ef4444',
  orange: '#f97316',
};

export default function StatCard({ label, value, icon, color = 'amber', sub }: StatCardProps) {
  const accent = colorMap[color];
  return (
    <div className="stat-card" style={{ '--accent': accent } as React.CSSProperties}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}
