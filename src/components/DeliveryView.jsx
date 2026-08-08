import React, { useState, useEffect } from 'react';
import { Truck, Package, Clock, CheckCircle2, DollarSign, MapPin, Search, ArrowUpRight, ShieldCheck, RefreshCw, Loader2, Inbox } from 'lucide-react';
import { fetchAvitoDeliveryOrders } from '../services/avitoApi';

export default function DeliveryView() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadRealDelivery = async () => {
    setIsLoading(true);
    try {
      const real = await fetchAvitoDeliveryOrders();
      if (real && real.length > 0) {
        setOrders(real);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error(e);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRealDelivery();
  }, []);

  const totalOrdersCount = orders.length;
  const inTransitCount = orders.filter(o => o.status === 'in_transit').length;
  const readyCount = orders.filter(o => o.status === 'ready_for_pickup').length;
  const totalPayout = orders
    .filter(o => o.status === 'completed' || o.status === 'in_transit' || o.status === 'ready_for_pickup')
    .reduce((sum, o) => sum + o.payoutAmount, 0);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.buyer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (o.trackNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (o.itemTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (o.city || '').toLowerCase().includes(searchTerm.toLowerCase());
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
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Мониторинг Авито Доставки
              <button
                onClick={loadRealDelivery}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                title="Обновить список доставок"
              >
                <RefreshCw size={14} />
              </button>
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

        {/* Detailed Delivery Orders Table / Empty State */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px' }}>
            <Loader2 className="animate-spin" size={32} color="var(--primary-avito)" />
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Загрузка заказов Авито Доставки...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(59, 130, 246, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#3b82f6'
            }}>
              <Truck size={28} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
              У вас пока нет заказов с Авито Доставкой
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto' }}>
              Когда покупатели оформят заказ через Авито Доставку, статус отправки, трек-код и сумма зачисления появятся в этой таблице.
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
