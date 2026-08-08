import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Eye, PhoneCall, Heart, TrendingUp, DollarSign, CheckSquare, Square, Layers } from 'lucide-react';

export default function AnalyticsCharts({ dailyStats, spendDistribution }) {
  const [metrics, setMetrics] = useState({
    impressions: true,
    views: true,
    contacts: true,
    favorites: true,
    ctr: false,
    spend: false
  });

  if (!dailyStats) return null;

  // Prepare chart data with calculated CTR
  const chartData = dailyStats.map(d => ({
    ...d,
    ctr: d.views > 0 ? Number(((d.contacts / d.views) * 100).toFixed(1)) : 0
  }));

  const toggleMetric = (key) => {
    setMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const metricConfigs = [
    { key: 'impressions', name: 'Показы', color: '#06b6d4', icon: Layers, unit: '' },
    { key: 'views', name: 'Просмотры', color: '#00aa8e', icon: Eye, unit: '' },
    { key: 'contacts', name: 'Контакты', color: '#3b82f6', icon: PhoneCall, unit: '' },
    { key: 'favorites', name: 'В Избранное', color: '#ec4899', icon: Heart, unit: '' },
    { key: 'ctr', name: 'CTR (%)', color: '#f59e0b', icon: TrendingUp, unit: '%' },
    { key: 'spend', name: 'Затраты (₽)', color: '#8b5cf6', icon: DollarSign, unit: ' ₽' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '12px 16px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          fontSize: '12px'
        }}>
          <p style={{ fontWeight: '700', color: '#fff', marginBottom: '8px' }}>{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} style={{ color: entry.color, margin: '4px 0', fontWeight: '600' }}>
              {entry.name}: {entry.value.toLocaleString('ru-RU')} {entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="charts-grid fade-in">
      {/* Main Dynamics Area Chart */}
      <div className="glass-card chart-card">
        <div className="chart-header" style={{ flexWrap: 'wrap', gap: '12px', alignItems: 'flex-start' }}>
          <div>
            <h3>Динамика показателей</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Аналитика по дням</span>
          </div>

          {/* Metric Selector Checkboxes */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {metricConfigs.map(m => {
              const isChecked = metrics[m.key];
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => toggleMetric(m.key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: `1px solid ${isChecked ? m.color : 'rgba(255,255,255,0.1)'}`,
                    background: isChecked ? `${m.color}15` : 'rgba(15, 23, 42, 0.4)',
                    color: isChecked ? m.color : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {isChecked ? (
                    <CheckSquare size={14} color={m.color} />
                  ) : (
                    <Square size={14} color="var(--text-dim)" />
                  )}
                  <Icon size={13} color={isChecked ? m.color : 'var(--text-muted)'} />
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ width: '100%', height: 320, marginTop: '10px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00aa8e" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#00aa8e" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorFavorites" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorCtr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />

              {metrics.impressions && (
                <Area type="monotone" dataKey="impressions" name="Показы" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorImpressions)" />
              )}
              {metrics.views && (
                <Area type="monotone" dataKey="views" name="Просмотры" stroke="#00aa8e" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
              )}
              {metrics.contacts && (
                <Area type="monotone" dataKey="contacts" name="Контакты" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorContacts)" />
              )}
              {metrics.favorites && (
                <Area type="monotone" dataKey="favorites" name="В Избранное" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorFavorites)" />
              )}
              {metrics.ctr && (
                <Area type="monotone" dataKey="ctr" name="CTR (%)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorCtr)" unit="%" />
              )}
              {metrics.spend && (
                <Area type="monotone" dataKey="spend" name="Затраты (₽)" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" unit=" ₽" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spend Distribution Pie Chart */}
      <div className="glass-card chart-card">
        <div className="chart-header">
          <h3>Распределение Бюджета</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>по услугам</span>
        </div>
        <div style={{ width: '100%', height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={spendDistribution}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={5}
                dataKey="value"
              >
                {spendDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span style={{ color: '#cbd5e1', fontSize: '12px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
