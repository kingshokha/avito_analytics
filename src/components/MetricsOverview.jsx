import React from 'react';
import { Eye, PhoneCall, Heart, Layers, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MetricsOverview({ kpis }) {
  if (!kpis) return null;

  const cards = [
    {
      id: 'impressions',
      title: 'Показы на Авито',
      value: (kpis.impressions?.value ?? 0).toLocaleString('ru-RU'),
      trend: kpis.impressions?.trend || 'Авто-синхронизация',
      isPositive: kpis.impressions?.isPositive ?? true,
      icon: Layers,
      color: '#06b6d4'
    },
    {
      id: 'views',
      title: 'Просмотры объявлений',
      value: (kpis.views?.value ?? 0).toLocaleString('ru-RU'),
      trend: kpis.views?.trend || 'Авто-синхронизация',
      isPositive: kpis.views?.isPositive ?? true,
      icon: Eye,
      color: '#00aa8e'
    },
    {
      id: 'contacts',
      title: 'Контакты (Лиды)',
      value: (kpis.contacts?.value ?? 0).toLocaleString('ru-RU'),
      trend: kpis.contacts?.trend || 'Авто-синхронизация',
      isPositive: kpis.contacts?.isPositive ?? true,
      icon: PhoneCall,
      color: '#3b82f6'
    },
    {
      id: 'favorites',
      title: 'В Избранное',
      value: (kpis.favorites?.value ?? 0).toLocaleString('ru-RU'),
      trend: kpis.favorites?.trend || 'Авто-синхронизация',
      isPositive: kpis.favorites?.isPositive ?? true,
      icon: Heart,
      color: '#ec4899'
    }
  ];

  return (
    <div className="kpi-grid fade-in">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.id} className="glass-card kpi-card" style={{ '--card-color': card.color }}>
            <div className="kpi-header">
              <span className="kpi-title">{card.title}</span>
              <div className="kpi-icon-box">
                <Icon size={20} />
              </div>
            </div>
            <div className="kpi-value">{card.value}</div>
            <div className={`kpi-trend ${card.isPositive ? 'positive' : 'negative'}`}>
              {card.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span>{card.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
