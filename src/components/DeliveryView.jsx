import React, { useState } from 'react';
import { Truck, Package, Clock, CheckCircle2, DollarSign, MapPin, Search, ArrowUpRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function DeliveryView() {
  const [orders, setOrders] = useState([
    {
      id: 'del-90182',
      trackNumber: 'AV-88492019',
      buyer: 'Игорь Васильев',
      city: 'Санкт-Петербург',
      itemTitle: 'iPhone 15 Pro Max 256GB Titanium',
      itemPrice: '114 990 ₽',
      payoutAmount: 111540,
      feeAmount: 3450,
      carrier: 'СДЭК',
      carrierColor: '#10b981',
      status: 'in_transit',
      statusText: 'В пути в город назначения',
      eta: 'Завтра, до 18:00',
      date: '08 авг 2026'
    },
    {
      id: 'del-88102',
      trackNumber: 'AV-77391024',
      buyer: 'Мария Семенова',
      city: 'Екатеринбург',
      itemTitle: 'Беспроводные наушники Sony WH-1000XM5',
      itemPrice: '28 500 ₽',
      payoutAmount: 27075,
      feeAmount: 1425,
      carrier: 'Почта России',
      carrierColor: '#3b82f6',
      status: 'ready_for_pickup',
      statusText: 'Ожидает в пункте выдачи',
      eta: 'Готов к выдаче (до 14 авг)',
      date: '06 авг 2026'
    },
    {
      id: 'del-77194',
      trackNumber: 'AV-66291048',
      buyer: 'Константин Рыбаков',
      city: 'Казань',
      itemTitle: 'Офисный стол Лофт из массива дуба',
      itemPrice: '34 000 ₽',
      payoutAmount: 32300,
      feeAmount: 1700,
      carrier: 'Boxberry',
      carrierColor: '#ec4899',
      status: 'completed',
      statusText: 'Завершен и Выплачен',
      eta: 'Получен покупателем',
      date: '03 авг 2026'
    },
    {
      id: 'del-66105',
      trackNumber: 'AV-55102938',
      buyer: 'Анна Кузнецова',
      city: 'Новосибирск',
      itemTitle: 'Игровой ПК Core i7 13700KF / RTX 4080',
      itemPrice: '189 000 ₽',
      payoutAmount: 183330,
      feeAmount: 5670,
      carrier: 'Avito Exmail',
      carrierColor: '#00aa8e',
      status: 'in_transit',
      statusText: 'Передан в курьерскую службу',
      eta: '11 авг 2026',
      date: '08 авг 2026'
    }
  ]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const totalOrdersCount = orders.length;
  const inTransitCount = orders.filter(o => o.status === 'in_transit').length;
  const readyCount = orders.filter(o => o.status === 'ready_for_pickup').length;
  const totalPayout = orders
    .filter(o => o.status === 'completed' || o.status === 'in_transit' || o.status === 'ready_for_pickup')
    .reduce((sum, o) => sum + o.payoutAmount, 0);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.trackNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.itemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status, text) => {
    switch (status) {
      case 'in_transit':
        return (
          <span className="status-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Truck size={12} style={{ display: 'inline', marginRight: '4px' }} />
            {text}
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="status-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
            {text}
          </span>
        );
      case 'completed':
        return (
          <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
            {text}
          </span>
        );
      default:
        return <span className="status-badge active">{text}</span>;
    }
  };

  return (
    <div className="fade-in">
      {/* Top KPI Cards for Delivery */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="glass-card kpi-card" style={{ '--card-color': '#00aa8e' }}>
          <div className="kpi-header">
            <span className="kpi-title">Всего заказов</span>
            <div className="kpi-icon-box"><Package size={20} /></div>
          </div>
          <div className="kpi-value">{totalOrdersCount}</div>
          <div className="kpi-trend positive">
            <ArrowUpRight size={14} />
            <span>Авито Доставка</span>
          </div>
        </div>

        <div className="glass-card kpi-card" style={{ '--card-color': '#3b82f6' }}>
          <div className="kpi-header">
            <span className="kpi-title">Заказы в пути</span>
            <div className="kpi-icon-box"><Truck size={20} /></div>
          </div>
          <div className="kpi-value">{inTransitCount}</div>
          <div className="kpi-trend positive">
            <Clock size={14} />
            <span>Отследить трек-код</span>
          </div>
        </div>

        <div className="glass-card kpi-card" style={{ '--card-color': '#f59e0b' }}>
          <div className="kpi-header">
            <span className="kpi-title">Готовы к выдаче</span>
            <div className="kpi-icon-box"><MapPin size={20} /></div>
          </div>
          <div className="kpi-value">{readyCount}</div>
          <div className="kpi-trend positive">
            <span>В пунктах выдачи</span>
          </div>
        </div>

        <div className="glass-card kpi-card" style={{ '--card-color': '#10b981' }}>
          <div className="kpi-header">
            <span className="kpi-title">Сумма к выплате</span>
            <div className="kpi-icon-box"><DollarSign size={20} /></div>
          </div>
          <div className="kpi-value">{totalPayout.toLocaleString('ru-RU')} ₽</div>
          <div className="kpi-trend positive">
            <ShieldCheck size={14} />
            <span>Безопасная сделка</span>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="glass-card table-card">
        <div className="table-controls" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              Мониторинг Авито Доставки
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Отслеживание статусов отправлений, трек-номеров и зачислений
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Status Filter Pipeline Tabs */}
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              {[
                { id: 'all', label: 'Все заказы' },
                { id: 'in_transit', label: 'В пути' },
                { id: 'ready_for_pickup', label: 'В пункте' },
                { id: 'completed', label: 'Выплачено' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  style={{
                    background: statusFilter === f.id ? 'var(--primary-avito)' : 'transparent',
                    color: statusFilter === f.id ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="search-input-box" style={{ width: '260px' }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Трек-код, имя, город..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Detailed Delivery Orders Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Товар и Трек-код</th>
                <th>Покупатель / Город</th>
                <th>Служба Доставки</th>
                <th>Сумма сделки</th>
                <th>К выплате</th>
                <th>Статус Доставки</th>
                <th>Срок доставки</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.id}>
                  <td>
                    <div>
                      <div className="item-title">{o.itemTitle}</div>
                      <div style={{ fontSize: '11px', color: 'var(--primary-avito)', fontFamily: 'monospace', fontWeight: '700', marginTop: '2px' }}>
                        {o.trackNumber}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{o.buyer}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{o.city}</div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      background: `${o.carrierColor}15`,
                      color: o.carrierColor,
                      border: `1px solid ${o.carrierColor}30`
                    }}>
                      <Truck size={12} />
                      {o.carrier}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700' }}>{o.itemPrice}</td>
                  <td>
                    <span style={{ fontWeight: '700', color: '#10b981' }}>
                      {o.payoutAmount.toLocaleString('ru-RU')} ₽
                    </span>
                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-dim)' }}>
                      Комиссия: {o.feeAmount} ₽
                    </span>
                  </td>
                  <td>{getStatusBadge(o.status, o.statusText)}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
