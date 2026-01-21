import React from 'react';
import { TrendingUp, TrendingDown, FileText, FileCheck, AlertCircle, AlertTriangle, DollarSign, Clock } from 'lucide-react';

export interface TrendData {
  value: number;
  isPositive: boolean;
  label?: string;
}

export type KPIVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

export interface BaseKPICardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: KPIVariant;
  trend?: TrendData;
  subtitle?: string;
  onClick?: () => void;
  loading?: boolean;
  className?: string;
}

export interface KPICardWithProgressProps extends BaseKPICardProps {
  progress?: number;
  progressLabel?: string;
}

const getVariantStyles = (variant: KPIVariant = 'primary') => {
  const styles = {
    primary: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'bg-blue-500 text-white',
      gradient: 'from-blue-500 to-blue-600',
      text: 'text-blue-600',
    },
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: 'bg-green-500 text-white',
      gradient: 'from-green-500 to-green-600',
      text: 'text-green-600',
    },
    warning: {
      bg: 'bg-orange-50 border-orange-200',
      icon: 'bg-orange-500 text-white',
      gradient: 'from-orange-500 to-orange-600',
      text: 'text-orange-600',
    },
    danger: {
      bg: 'bg-red-50 border-red-200',
      icon: 'bg-red-500 text-white',
      gradient: 'from-red-500 to-red-600',
      text: 'text-red-600',
    },
    info: {
      bg: 'bg-cyan-50 border-cyan-200',
      icon: 'bg-cyan-500 text-white',
      gradient: 'from-cyan-500 to-cyan-600',
      text: 'text-cyan-600',
    },
    purple: {
      bg: 'bg-purple-50 border-purple-200',
      icon: 'bg-purple-500 text-white',
      gradient: 'from-purple-500 to-purple-600',
      text: 'text-purple-600',
    },
  };
  return styles[variant];
};

const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
  </div>
);

export const KPICard: React.FC<BaseKPICardProps> = ({
  title,
  value,
  icon,
  variant = 'primary',
  trend,
  subtitle,
  onClick,
  loading = false,
  className = '',
}) => {
  const styles = getVariantStyles(variant);
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg border-2 ${styles.bg} p-6 transition-all
        ${isClickable ? 'cursor-pointer hover:shadow-lg hover:scale-105' : 'hover:shadow-md'}
        ${className}
      `}
    >
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>

            {trend && (
              <div className="flex items-center gap-1">
                {trend.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                {trend.label && (
                  <span className="text-sm text-gray-500 ml-1">{trend.label}</span>
                )}
              </div>
            )}

            {subtitle && (
              <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
            )}
          </div>

          {icon && (
            <div className={`${styles.icon} p-3 rounded-lg flex-shrink-0`}>
              {icon}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Card: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const handleCardClick = (cardName: string) => {
    console.log(`Clicked: ${cardName}`);
    alert(`You clicked: ${cardName}`);
  };

  const demoData = [
    {
      title: 'Total Leases',
      value: 48,
      trend: { value: 12, isPositive: true, label: 'vs last month' },
      icon: <FileText className="w-6 h-6" />,
      variant: 'primary' as KPIVariant,
      subtitle: '12 new this month',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">KPI Cards Component Library</h1>
            <p className="text-gray-600">All components in one file - ready to use anywhere</p>
          </div>
        </div>

        {/* Standard KPI Cards */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-mono mr-2">KPICard</span>
            Standard Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoData.map((kpi, index) => (
              <KPICard
                key={index}
                title={kpi.title}
                value={kpi.value}
                trend={kpi.trend}
                icon={kpi.icon}
                variant={kpi.variant}
                subtitle={kpi.subtitle}
                onClick={() => handleCardClick(kpi.title)}
                loading={loading}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default { KPICard, getVariantStyles };