import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MetricsOverview from './components/MetricsOverview';
import AnalyticsCharts from './components/AnalyticsCharts';
import ItemsTable from './components/ItemsTable';
import CampaignsView from './components/CampaignsView';
import DeliveryView from './components/DeliveryView';
import ApiSettingsModal from './components/ApiSettingsModal';
import { fetchDashboardData, getStoredCredentials } from './services/avitoApi';
import { AlertCircle, CheckCircle, Info, Loader2, Bug, ChevronDown, ChevronUp } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState({ isConnected: false, clientId: null });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDashboardData(selectedPeriod);
      setDashboardData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const creds = getStoredCredentials();
    if (creds) {
      setApiStatus({ isConnected: true, clientId: creds.clientId });
    }
  }, [selectedPeriod]);

  const handleStatusChange = (status) => {
    setApiStatus(status);
    loadData();
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiStatus={apiStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="main-content">
        <Header
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          onRefresh={loadData}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isConnected={apiStatus.isConnected}
        />

        <div className="page-body">
          {/* Banner notification for API connection status */}
          {dashboardData && dashboardData.apiNotice && (
            <div className="glass-card fade-in" style={{
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              borderLeft: `4px solid ${dashboardData.isReal ? '#10b981' : '#f59e0b'}`,
              background: dashboardData.isReal ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'
            }}>
              {dashboardData.isReal ? (
                <CheckCircle color="#10b981" size={22} style={{ flexShrink: 0 }} />
              ) : (
                <AlertCircle color="#f59e0b" size={22} style={{ flexShrink: 0 }} />
              )}
              <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                <strong style={{ display: 'block', marginBottom: '2px' }}>
                  {dashboardData.isReal ? 'Реальный Avito API подключен' : 'Внимание по API'}
                </strong>
                {dashboardData.apiNotice}
              </div>
            </div>
          )}

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
              <Loader2 className="animate-spin" size={36} color="var(--primary-avito)" />
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Загрузка данных из Avito API...</span>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && dashboardData && (
                <>
                  <MetricsOverview kpis={dashboardData.kpis} />
                  <AnalyticsCharts
                    dailyStats={dashboardData.dailyStats}
                    spendDistribution={dashboardData.spendDistribution}
                  />
                  <ItemsTable items={dashboardData.items} />
                </>
              )}

              {activeTab === 'items' && dashboardData && (
                <ItemsTable items={dashboardData.items} />
              )}

              {activeTab === 'delivery' && (
                <DeliveryView />
              )}

              {activeTab === 'campaigns' && dashboardData && (
                <CampaignsView spendDistribution={dashboardData.spendDistribution} />
              )}

              {activeTab === 'settings' && (
                <div className="glass-card" style={{ padding: '32px', maxWidth: '640px', margin: '0 auto' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
                    Интеграция с Avito API
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
                    Подключите ваш личный кабинет Avito для профессионалов, чтобы получать реальные данные о просмотрах, контактах и расходах в режиме реального времени.
                  </p>
                  <button className="btn-primary" onClick={() => setIsSettingsOpen(true)}>
                    Открыть форму подключения Avito API
                  </button>
                </div>
              )}

              {/* Debug RAW API Inspector Panel */}
              {dashboardData && dashboardData.rawDebugInfo && (
                <div className="glass-card" style={{ marginTop: '36px', padding: '20px' }}>
                  <button
                    onClick={() => setShowDebug(!showDebug)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary-avito)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      width: '100%',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bug size={16} />
                      <span>🔍 Отладка Avito API — Показать сырые ответы от сервера (JSON)</span>
                    </div>
                    {showDebug ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showDebug && (
                    <div style={{ marginTop: '16px', fontSize: '12px', color: '#cbd5e1' }}>
                      <p style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>
                        Здесь отображаются точные ответы, которые вернул официальный сервер <code>api.avito.ru</code> для вашего аккаунта:
                      </p>

                      <div style={{ marginBottom: '14px' }}>
                        <strong style={{ color: '#38bdf8' }}>1. Ответ сервера по профилю (/core/v1/accounts/self):</strong>
                        <pre style={{ background: '#020617', padding: '12px', borderRadius: '8px', overflowX: 'auto', marginTop: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {JSON.stringify(dashboardData.rawDebugInfo.userInfo, null, 2)}
                        </pre>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <strong style={{ color: '#38bdf8' }}>2. Ответ сервера по списку объявлений (/core/v1/items):</strong>
                        <pre style={{ background: '#020617', padding: '12px', borderRadius: '8px', overflowX: 'auto', marginTop: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {JSON.stringify(dashboardData.rawDebugInfo.itemsResponse, null, 2)}
                        </pre>
                      </div>

                      <div>
                        <strong style={{ color: '#38bdf8' }}>3. Ответ сервера по статистике (/stats/v1/accounts/.../items):</strong>
                        <pre style={{ background: '#020617', padding: '12px', borderRadius: '8px', overflowX: 'auto', marginTop: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {JSON.stringify(dashboardData.rawDebugInfo.statsResponse, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
