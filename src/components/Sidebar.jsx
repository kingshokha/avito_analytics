import React from 'react';
import { LayoutDashboard, ShoppingBag, TrendingUp, Truck, Settings, Zap } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, apiStatus, onOpenSettings }) {
  const menuItems = [
    { id: 'overview', label: 'Обзор и KPI', icon: LayoutDashboard },
    { id: 'items', label: 'Мои Объявления', icon: ShoppingBag },
    { id: 'delivery', label: 'Авито Доставка & История', icon: Truck },
    { id: 'campaigns', label: 'Кампании и ROI', icon: TrendingUp },
    { id: 'settings', label: 'Интеграция API', icon: Settings }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-badge">A</div>
        <div className="logo-text">
          <h1>Авито Аналитика</h1>
          <span>Pro Dashboard</span>
        </div>
      </div>

      <nav className="nav-menu">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <IconComponent />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="api-status-badge" onClick={onOpenSettings} style={{ cursor: 'pointer' }}>
          <div>
            <span className={`status-indicator ${apiStatus.isConnected ? 'connected' : 'demo'}`}></span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              {apiStatus.isConnected ? 'Avito API Подключен' : 'Демо Режим'}
            </span>
          </div>
          <Zap size={14} color={apiStatus.isConnected ? '#10b981' : '#f59e0b'} />
        </div>
      </div>
    </aside>
  );
}
