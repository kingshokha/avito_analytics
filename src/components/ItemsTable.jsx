import React, { useState } from 'react';
import { Search, ArrowUpDown, Zap, CheckCircle2, Archive, Trash2, AlertCircle, FileText, Ban } from 'lucide-react';

const STATUS_MAP = {
  active: { label: 'Активное', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', icon: CheckCircle2 },
  old: { label: 'Архив', color: '#cbd5e1', bg: 'rgba(148, 163, 184, 0.15)', icon: Archive },
  removed: { label: 'Удалено', color: '#fb7185', bg: 'rgba(244, 63, 94, 0.15)', icon: Trash2 },
  blocked: { label: 'Заблокировано', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', icon: Ban },
  rejected: { label: 'Отклонено', color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', icon: AlertCircle },
  draft: { label: 'Черновик', color: '#c084fc', bg: 'rgba(139, 92, 246, 0.15)', icon: FileText },
  unpublished: { label: 'Неопубликовано', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)', icon: FileText },
  deactivated: { label: 'Неактивно', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)', icon: FileText },
  inactive: { label: 'Неактивно', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)', icon: FileText }
};

export default function ItemsTable({ items }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('numericId');
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

  // Calculate status counts
  const counts = {
    all: items.length,
    active: items.filter(i => i.status === 'active' || i.status === 'promo').length,
    old: items.filter(i => i.status === 'old' || i.status === 'archive').length,
    draft: items.filter(i => ['draft', 'unpublished', 'deactivated', 'inactive', 'not_published'].includes(i.status)).length,
    removed: items.filter(i => i.status === 'removed').length,
    blocked: items.filter(i => i.status === 'blocked' || i.status === 'rejected').length
  };

  const filteredItems = items
    .filter(item => {
      // Search filter
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status tab filter
      if (statusFilter === 'all') return matchesSearch;
      if (statusFilter === 'active') return matchesSearch && (item.status === 'active' || item.status === 'promo');
      if (statusFilter === 'old') return matchesSearch && (item.status === 'old' || item.status === 'archive');
      if (statusFilter === 'removed') return matchesSearch && item.status === 'removed';
      if (statusFilter === 'draft') return matchesSearch && ['draft', 'unpublished', 'deactivated', 'inactive', 'not_published'].includes(item.status);
      if (statusFilter === 'blocked') return matchesSearch && (item.status === 'blocked' || item.status === 'rejected');
      
      return matchesSearch;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (sortField === 'price') {
        valA = a.rawPrice !== undefined ? a.rawPrice : (typeof a.price === 'string' && a.price.includes('₽') ? parseInt(a.price.replace(/\D/g, ''), 10) : 0);
        valB = b.rawPrice !== undefined ? b.rawPrice : (typeof b.price === 'string' && b.price.includes('₽') ? parseInt(b.price.replace(/\D/g, ''), 10) : 0);
      } else if (typeof valA === 'string' && valA.includes('₽')) {
        valA = parseInt(valA.replace(/\D/g, ''), 10);
        valB = parseInt(valB.replace(/\D/g, ''), 10);
      }
      
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const getStatusBadge = (statusKey) => {
    const cfg = STATUS_MAP[statusKey] || STATUS_MAP.active;
    const Icon = cfg.icon;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '700',
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}30`
      }}>
        <Icon size={12} color={cfg.color} />
        <span>{cfg.label}</span>
      </span>
    );
  };

  const statusTabs = [
    { id: 'all', label: `Все (${counts.all})` },
    { id: 'active', label: `🟢 Активные (${counts.active})` },
    { id: 'draft', label: `🟣 Неопубликованные (${counts.draft})` },
    { id: 'old', label: `⚪ Архив (${counts.old})` },
    { id: 'removed', label: `🔴 Удаленные (${counts.removed})` },
    { id: 'blocked', label: `🟠 Блок (${counts.blocked})` }
  ];

  return (
    <div className="glass-card table-card fade-in">
      <div className="table-controls">
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            Эффективность Объявлений
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Статистика по объектам (по умолчанию первыми идут новые публикации)
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

      {/* Avito Status Category Filter Tabs with Item Counts */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
        {statusTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setStatusFilter(t.id)}
            style={{
              background: statusFilter === t.id ? 'rgba(0, 170, 142, 0.2)' : 'rgba(15, 23, 42, 0.4)',
              color: statusFilter === t.id ? 'var(--primary-avito)' : 'var(--text-muted)',
              border: `1px solid ${statusFilter === t.id ? 'var(--primary-avito)' : 'rgba(255,255,255,0.08)'}`,
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: statusFilter === t.id ? '0 0 10px rgba(0, 170, 142, 0.2)' : 'none'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('numericId')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Объявление <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Статус на Авито</th>
              <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Актуальная Цена <ArrowUpDown size={12} />
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
                <td>
                  {getStatusBadge(item.status)}
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{
                      fontWeight: '700',
                      color: item.price === 'Бесплатно' ? '#10b981' : 'var(--text-main)'
                    }}>
                      {item.price}
                    </span>
                    {item.hasDiscount && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <s style={{ fontSize: '11px', color: '#64748b' }}>{item.oldPrice}</s>
                        <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '1px 5px', borderRadius: '4px', fontWeight: '700' }}>
                          -{item.discountPercent}%
                        </span>
                      </div>
                    )}
                  </div>
                </td>
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
