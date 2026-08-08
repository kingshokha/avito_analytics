import React from 'react';
import { Eye, PhoneCall, Heart, DollarSign, Target, Award, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

export default function MetricsOverview({ kpis }) {
  if (!kpis) return null;

  const cards = [
    {
      id: 'impressions',
      title: 'Показы на Авито',
      value: (kpis.impressions?.value || 0).toLocaleString('ru-RU'),
      trend: kpis.impressions?.trend || 'Авто-синхронизация',
      isPositive: true,
      icon: Layers,
      color: '#06b6d4'
    },
    {
      id: 'views',
      title: 'Просмотры объявлений',
      value: (kpis.views?.value || 0).toLocaleString('ru-RU'),
      trend: kpis.views?.trend || 'Авто-синхронизация',
      isPositive: true,
      icon: Eye,
      color: '#00aa8e'
    },
    {
      id: 'contacts',
      title: 'Контакты (Лиды)',
      value: (kpis.contacts?.value || 0).toLocaleString('ru-RU'),
      trend: kpis.contacts?.trend || 'Авто-синхронизация',
      isPositive: true,
      icon: PhoneCall,
      color: '#3b82f6'
    },
    {
      id: 'favorites',
      title: 'В Избранное',
      value: (kpis.favorites?.value || 0).toLocaleString('ru-RU'),
      trend: kpis.favorites?.trend || 'Авто-синхронизация',
      isPositive: true,
      icon: Heart,
      color: '#ec4899'
    },
    {
      id: 'spend',
      title: 'Бюджет Продвижения',
      value: kpis.spend?.value || '0 ₽',
      trend: kpis.spend?.trend || 'Фактические расходы',
      isPositive: true,
      icon: DollarSign,
      color: '#f59e0b'
    },
    {
      id: 'cpl',
      title: 'Стоимость лида (CPL)',
      value: kpis.cpl?.value || '0 ₽',
      trend: kpis.cpl?.trend || 'Авто-расчет',
      isPositive: true,
      icon: Target,
      color: '#8b5cf6'
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
              <ArrowUpRight size={14} />
              <span>{card.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
