import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, ExternalLink, Zap, Archive, CheckCircle2 } from 'lucide-react';

export default function ItemsTable({ items }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // 'all', 'active', 'archived'
  const [sortField, setSortField] = useState('contacts');
  const [sortAsc, setSortAsc] = useState(false);

  if (!items) return null;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredItems = items
    .filter(item => {
      const matchesSearch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const isArchived = item.status === 'old' || item.status === 'removed' || item.status === 'blocked' || (item.title || '').startsWith('[Архив]');
      
      if (statusFilter === 'active') return matchesSearch && !isArchived;
      if (statusFilter === 'archived') return matchesSearch && isArchived;
      return matchesSearch;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (typeof valA === 'string' && valA.includes('₽')) {
        valA = parseInt(valA.replace(/\D/g, ''), 10) || 0;
        valB = parseInt(valB.replace(/\D/g, ''), 10) || 0;
      }
      
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  return (
    <div className="glass-card table-card fade-in">
      <div className="table-controls" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            Эффективность Объявлений
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Статистика просмотров, контактов и затрат по вашим позициям
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Status Filter Pipeline Tabs */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'active', label: 'Активные' },
              { id: 'archived', label: 'В архиве / Снятые' },
              { id: 'all', label: 'Все объявления' }
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

          <div className="search-input-box" style={{ width: '240px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Объявление</th>
              <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Цена <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('views')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Просмотры <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('contacts')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Контакты <ArrowUpDown size={12} />
                </div>
              </th>
              <th>CTR</th>
              <th onClick={() => handleSort('spend')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Затраты <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Статус / Продвижение</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  {statusFilter === 'archived' 
                    ? 'В архиве пока нет сохраненных или снятых объявлений.' 
                    : 'Объявлений по данному фильтру не найдено.'}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isArchived = item.status === 'old' || item.status === 'removed' || item.status === 'blocked' || (item.title || '').startsWith('[Архив]');

                return (
                  <tr key={item.id}>
                    <td>
                      <div className="item-cell">
                        <img src={item.img} alt={item.title} className="item-img" />
                        <div>
                          <div className="item-title">{item.title}</div>
                          <div className="item-category">ID: {item.id} • {item.category}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: '700' }}>{item.price}</td>
                    <td>{item.views.toLocaleString('ru-RU')}</td>
                    <td>
                      <span style={{
                        fontWeight: '700',
                        color: '#3b82f6',
                        background: 'rgba(59, 130, 246, 0.12)',
                        padding: '4px 10px',
                        borderRadius: '6px'
                      }}>
                        {item.contacts}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--primary-avito)' }}>{item.ctr}</td>
                    <td style={{ fontWeight: '600' }}>{item.spend.toLocaleString('ru-RU')} ₽</td>
                    <td>
                      {isArchived ? (
                        <span className="status-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                          <Archive size={10} style={{ display: 'inline', marginRight: '4px' }} />
                          Снято / Архив
                        </span>
                      ) : (
                        <span className={`status-badge ${item.service.includes('X10') ? 'promo' : 'active'}`}>
                          <Zap size={10} style={{ display: 'inline', marginRight: '4px' }} />
                          {item.service}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
