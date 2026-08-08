import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, ExternalLink, Zap } from 'lucide-react';

export default function ItemsTable({ items }) {
  const [searchTerm, setSearchTerm] = useState('');
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
    .filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (typeof valA === 'string' && valA.includes('₽')) {
        valA = parseInt(valA.replace(/\D/g, ''), 10);
        valB = parseInt(valB.replace(/\D/g, ''), 10);
      }
      
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  return (
    <div className="glass-card table-card fade-in">
      <div className="table-controls">
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            Эффективность Объявлений
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Статистика по активным и продвигаемым позициям на Авито
          </p>
        </div>

        <div className="search-input-box">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Поиск по названию или категории..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
              <th>Услуга</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
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
                  <span className={`status-badge ${item.spend > 0 ? 'promo' : 'active'}`}>
                    <Zap size={10} style={{ display: 'inline', marginRight: '4px' }} />
                    {item.service}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
