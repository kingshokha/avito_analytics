import React from 'react';
import { Calendar, RefreshCw, Key, Download } from 'lucide-react';

export default function Header({ selectedPeriod, setSelectedPeriod, onRefresh, onOpenSettings, isConnected }) {
  return (
    <header className="top-header">
      <div className="header-title">
        <h2>Сводный отчет эффективности</h2>
      </div>

      <div className="header-controls">
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          {['7', '14', '30', '90'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              style={{
                background: selectedPeriod === p ? 'var(--primary-avito)' : 'transparent',
                color: selectedPeriod === p ? '#fff' : 'var(--text-muted)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {p} дней
            </button>
          ))}
        </div>

        <button className="btn-secondary" onClick={onRefresh} title="Обновить данные">
          <RefreshCw size={15} />
          <span>Обновить</span>
        </button>

        <button className="btn-primary" onClick={onOpenSettings}>
          <Key size={15} />
          <span>{isConnected ? 'API Настройки' : 'Подключить API'}</span>
        </button>
      </div>
    </header>
  );
}
