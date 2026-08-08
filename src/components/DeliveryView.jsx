import React, { useState, useEffect } from 'react';
import { Truck, Package, Clock, CheckCircle2, DollarSign, MapPin, Search, ArrowUpRight, ShieldCheck, RefreshCw, Loader2, History, Plus, X } from 'lucide-react';
import { fetchAvitoDeliveryOrders, saveManualDeliveryOrder } from '../services/avitoApi';

export default function DeliveryView() {
  const [orders, setOrders] = useState([]);
  const [activeTabSection, setActiveTabSection] = useState('active'); // 'active' or 'history'
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal for manually adding past orders
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
    trackNumber: '',
    itemTitle: '',
    buyer: '',
    city: '',
    price: '',
    carrier: 'СДЭК',
    status: 'completed'
  });

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

  const handleAddOrderSubmit = (e) => {
    e.preventDefault();
    if (!newOrderForm.itemTitle || !newOrderForm.price) return;

    const priceNum = Number(newOrderForm.price.replace(/\D/g, '')) || 0;
    const manualOrder = {
      id: `manual-${Date.now()}`,
      trackNumber: newOrderForm.trackNumber || `AV-${Math.floor(Math.random()*899999 + 100000)}`,
      buyer: newOrderForm.buyer || 'Покупатель Авито',
      city: newOrderForm.city || 'Россия',
      itemTitle: newOrderForm.itemTitle,
      itemPrice: `${priceNum.toLocaleString('ru-RU')} ₽`,
      payoutAmount: Math.round(priceNum * 0.97),
      feeAmount: Math.round(priceNum * 0.03),
      carrier: newOrderForm.carrier || 'СДЭК',
      carrierColor: '#10b981',
      status: newOrderForm.status,
      statusText: newOrderForm.status === 'completed' ? 'Завершен и Выплачен' : 'В процессе доставки',
      eta: 'Архив',
      date: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    saveManualDeliveryOrder(manualOrder);
    setOrders(prev => [manualOrder, ...prev]);
    setIsAddModalOpen(false);
    setNewOrderForm({ trackNumber: '', itemTitle: '', buyer: '', city: '', price: '', carrier: 'СДЭК', status: 'completed' });
  };

  // Separate active vs historical orders
  const activeOrders = orders.filter(o => o.status === 'in_transit' || o.status === 'ready_for_pickup');
  const historyOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled' || o.status === 'delivered');

  const currentDisplayOrders = activeTabSection === 'active' ? activeOrders : historyOrders;

  const totalOrdersCount = orders.length;
  const inTransitCount = activeOrders.filter(o => o.status === 'in_transit').length;
  const readyCount = activeOrders.filter(o => o.status === 'ready_for_pickup').length;
  const completedCount = historyOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
  
  const totalPayout = orders
    .filter(o => o.status === 'completed' || o.status === 'in_transit' || o.status === 'ready_for_pickup')
    .reduce((sum, o) => sum + (o.payoutAmount || 0), 0);

  const filteredOrders = currentDisplayOrders.filter(o => {
    const matchesSearch = (o.buyer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (o.trackNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (o.itemTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (o.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status, text) => {
    switch (status) {
      case 'in_transit':
        return (
          <span className="status-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Truck size={12} style={{ display: 'inline', marginRight: '4px' }} />
            {text || 'В пути'}
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="status-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
            {text || 'Ожидает в ПВЗ'}
          </span>
        );
      case 'completed':
      case 'delivered':
        return (
          <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
            {text || 'Получен и Выплачен'}
          </span>
        );
      default:
        return <span className="status-badge active">{text || 'Обработан'}</span>;
    }
  };

  return (
    <div className="fade-in">
      {/* Sub-navigation & Manual Order Add Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveTabSection('active')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '12px',
              border: `1px solid ${activeTabSection === 'active' ? 'var(--primary-avito)' : 'var(--border-color)'}`,
              background: activeTabSection === 'active' ? 'rgba(0, 170, 142, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: activeTabSection === 'active' ? '#00aa8e' : 'var(--text-muted)',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Truck size={18} />
            <span>Активные доставки ({activeOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTabSection('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '12px',
              border: `1px solid ${activeTabSection === 'history' ? 'var(--primary-avito)' : 'var(--border-color)'}`,
              background: activeTabSection === 'history' ? 'rgba(0, 170, 142, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: activeTabSection === 'history' ? '#00aa8e' : 'var(--text-muted)',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <History size={18} />
            <span>История завершенных ({historyOrders.length})</span>
          </button>
        </div>

        <button
          className="btn-secondary"
          onClick={() => setIsAddModalOpen(true)}
          style={{ padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>Добавить прошлую доставку</span>
        </button>
      </div>

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
            <span className="kpi-title">В пути</span>
            <div className="kpi-icon-box"><Truck size={20} /></div>
          </div>
          <div className="kpi-value">{inTransitCount}</div>
          <div className="kpi-trend positive">
            <Clock size={14} />
            <span>Текущие посылки</span>
          </div>
        </div>

        <div className="glass-card kpi-card" style={{ '--card-color': '#f59e0b' }}>
          <div className="kpi-header">
            <span className="kpi-title">В пунктах выдачи</span>
            <div className="kpi-icon-box"><MapPin size={20} /></div>
          </div>
          <div className="kpi-value">{readyCount}</div>
          <div className="kpi-trend positive">
            <span>Ожидают вручения</span>
          </div>
        </div>

        <div className="glass-card kpi-card" style={{ '--card-color': '#10b981' }}>
          <div className="kpi-header">
            <span className="kpi-title">Успешно завершено</span>
            <div className="kpi-icon-box"><CheckCircle2 size={20} /></div>
          </div>
          <div className="kpi-value">{completedCount}</div>
          <div className="kpi-trend positive">
            <ShieldCheck size={14} />
            <span>Выплаты: {totalPayout.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="glass-card table-card">
        <div className="table-controls" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeTabSection === 'active' ? '🚚 Активные отправления' : '📜 История выполненных доставок'}
              <button
                onClick={loadRealDelivery}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                title="Обновить список отправок"
              >
                <RefreshCw size={14} />
              </button>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {activeTabSection === 'active' 
                ? 'Мониторинг заказов находящихся в процессе логистики и выдачи' 
                : 'Архив всех успешно полученных и выплаченных на карту заказов Авито'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-input-box" style={{ width: '280px' }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Трек-код, имя покупателя, город..."
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
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Синхронизация истории доставок с Авито...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: activeTabSection === 'active' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: activeTabSection === 'active' ? '#3b82f6' : '#10b981'
            }}>
              {activeTabSection === 'active' ? <Truck size={28} /> : <History size={28} />}
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
              {activeTabSection === 'active' 
                ? 'Нет активных заказов в процессе отправки' 
                : 'История завершенных доставок пока пуста'}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              {activeTabSection === 'active'
                ? 'Когда покупатель оформит заказ Авито Доставкой, статус посылки и трек-номер автоматически появятся здесь.'
                : 'Завершенные выплаченные доставки подтягиваются из профиля Авито API. Вы также можете вручную добавить прошлый трек-номер ниже.'}
            </p>
            <button className="btn-secondary" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={14} />
              <span>Добавить прошлый трек-код вручную</span>
            </button>
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
                  <th>Выплата на карту</th>
                  <th>Статус</th>
                  <th>Дата завершения / Срок</th>
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
                        background: `${o.carrierColor || '#00aa8e'}15`,
                        color: o.carrierColor || '#00aa8e',
                        border: `1px solid ${o.carrierColor || '#00aa8e'}30`
                      }}>
                        <Truck size={12} />
                        {o.carrier || 'Авито'}
                      </span>
                    </td>
                    <td style={{ fontWeight: '700' }}>{o.itemPrice}</td>
                    <td>
                      <span style={{ fontWeight: '700', color: '#10b981' }}>
                        {o.payoutAmount ? `${o.payoutAmount.toLocaleString('ru-RU')} ₽` : o.itemPrice}
                      </span>
                      {o.feeAmount > 0 && (
                        <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-dim)' }}>
                          Комиссия: {o.feeAmount} ₽
                        </span>
                      )}
                    </td>
                    <td>{getStatusBadge(o.status, o.statusText)}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.eta || o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Past Order Add Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(2, 6, 23, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '24px', position: 'relative' }}>
            <button
              onClick={() => setIsAddModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
              Внести прошлую доставку в историю
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Введите трек-номер или наименование проданного товара для добавления в архив доставок
            </p>

            <form onSubmit={handleAddOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Наименование товара *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Например: Игровой ПК Core i7 / RTX 4080"
                  required
                  value={newOrderForm.itemTitle}
                  onChange={e => setNewOrderForm({ ...newOrderForm, itemTitle: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Трек-номер отправки</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="AV-12345678"
                    value={newOrderForm.trackNumber}
                    onChange={e => setNewOrderForm({ ...newOrderForm, trackNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Сумма продажи (₽) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="25 000"
                    required
                    value={newOrderForm.price}
                    onChange={e => setNewOrderForm({ ...newOrderForm, price: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Покупатель</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Имя покупателя"
                    value={newOrderForm.buyer}
                    onChange={e => setNewOrderForm({ ...newOrderForm, buyer: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Город назначения</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Москва / Санкт-Петербург"
                    value={newOrderForm.city}
                    onChange={e => setNewOrderForm({ ...newOrderForm, city: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Служба доставки</label>
                  <select
                    className="form-input"
                    value={newOrderForm.carrier}
                    onChange={e => setNewOrderForm({ ...newOrderForm, carrier: e.target.value })}
                  >
                    <option value="СДЭК">СДЭК</option>
                    <option value="Почта России">Почта России</option>
                    <option value="Boxberry">Boxberry</option>
                    <option value="Avito Exmail">Avito Exmail</option>
                    <option value="DPD">DPD</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Статус заказа</label>
                  <select
                    className="form-input"
                    value={newOrderForm.status}
                    onChange={e => setNewOrderForm({ ...newOrderForm, status: e.target.value })}
                  >
                    <option value="completed">Успешно завершен и выплачен</option>
                    <option value="in_transit">В пути к покупателю</option>
                    <option value="ready_for_pickup">Ожидает в пункте выдачи</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsAddModalOpen(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Сохранить в историю
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
