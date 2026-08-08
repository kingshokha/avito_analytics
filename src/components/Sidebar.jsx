import React from 'react';
import { LayoutDashboard, ShoppingBag, Settings, Zap } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, apiStatus, onOpenSettings }) {
  const menuItems = [
    { id: 'overview', label: 'Обзор и KPI', icon: LayoutDashboard },
    { id: 'items', label: 'Мои Объявления', icon: ShoppingBag },
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
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <IconComponent />
              <span>{item.label}</span>
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
