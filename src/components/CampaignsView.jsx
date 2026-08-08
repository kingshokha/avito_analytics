import React from 'react';
import { TrendingUp, Layers, CheckCircle2, DollarSign, Award, AlertCircle } from 'lucide-react';

export default function CampaignsView({ spendDistribution }) {
  const campaigns = [
    {
      id: 'cmp-01',
      name: 'Кампания: Премиум Электроника',
      strategy: 'X10 Продвижение на 7 дней',
      budget: '25 000 ₽',
      spent: '18 400 ₽',
      leads: 312,
      cpl: '59 ₽',
      revenue: '420 000 ₽',
      roi: '2180%',
      status: 'active'
    },
    {
      id: 'cmp-02',
      name: 'Кампания: Недвижимость Аренда',
      strategy: 'Выделение цветом + XL-объявления',
      budget: '15 000 ₽',
      spent: '12 800 ₽',
      leads: 245,
      cpl: '52 ₽',
      revenue: '380 000 ₽',
      roi: '2860%',
      status: 'active'
    },
    {
      id: 'cmp-03',
      name: 'Кампания: Мебель & Интерьер',
      strategy: 'X5 Продвижение на 1 день',
      budget: '10 000 ₽',
      spent: '7 200 ₽',
      leads: 89,
      cpl: '80 ₽',
      revenue: '110 000 ₽',
      roi: '1420%',
      status: 'paused'
    }
  ];

  return (
    <div className="fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Award color="#00aa8e" size={24} />
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>Лучшая стратегия</h4>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Услуга <strong style={{ color: '#00aa8e' }}>X10 Продвижение</strong> показывает наивысшую конверсию в лид (8.3%) и окупаемость <strong>+2180%</strong>.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <DollarSign color="#3b82f6" size={24} />
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>Оптимизация CPL</h4>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Средняя стоимость лида снизилась на <strong style={{ color: '#3b82f6' }}>12%</strong> благодаря автоматическому распределению бюджета на популярные часы.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Layers color="#8b5cf6" size={24} />
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>Рекомендации Авито API</h4>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Рекомендуется подключить услугу <strong style={{ color: '#8b5cf6' }}>XL-объявление</strong> для категории «Компьютеры» для повышения кликабельности (CTR).
          </p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px' }}>
          Активные рекламные кампании
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Название Кампании</th>
                <th>Стратегия</th>
                <th>Израсходовано</th>
                <th>Лиды</th>
                <th>CPL</th>
                <th>Выручка (Оценка)</th>
                <th>ROI</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((cmp) => (
                <tr key={cmp.id}>
                  <td style={{ fontWeight: '700' }}>{cmp.name}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cmp.strategy}</td>
                  <td>{cmp.spent} / {cmp.budget}</td>
                  <td style={{ fontWeight: '700', color: '#3b82f6' }}>{cmp.leads}</td>
                  <td>{cmp.cpl}</td>
                  <td style={{ fontWeight: '700', color: '#10b981' }}>{cmp.revenue}</td>
                  <td style={{ fontWeight: '800', color: '#00aa8e' }}>{cmp.roi}</td>
                  <td>
                    <span className={`status-badge ${cmp.status === 'active' ? 'promo' : 'active'}`}>
                      {cmp.status === 'active' ? 'Активна' : 'Пауза'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
