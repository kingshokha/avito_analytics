import React, { useState, useEffect } from 'react';
import { X, Key, Shield, CheckCircle2, Trash2, ExternalLink } from 'lucide-react';
import { getStoredCredentials, saveCredentials, clearCredentials } from '../services/avitoApi';

export default function ApiSettingsModal({ isOpen, onClose, onStatusChange }) {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [customItemIds, setCustomItemIds] = useState('');
  const [savedData, setSavedData] = useState(null);

  useEffect(() => {
    const creds = getStoredCredentials();
    if (creds) {
      setSavedData(creds);
      setClientId(creds.clientId);
      setCustomItemIds(creds.customItemIds || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!clientId || !clientSecret) return;

    const saved = saveCredentials(clientId, clientSecret, customItemIds);
    setSavedData(saved);
    onStatusChange({ isConnected: true, clientId });
    onClose();
  };

  const handleDisconnect = () => {
    clearCredentials();
    setSavedData(null);
    setClientId('');
    setClientSecret('');
    setCustomItemIds('');
    onStatusChange({ isConnected: false, clientId: null });
  };

  return (
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(0, 170, 142, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-avito)'
          }}>
            <Key size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
              Настройка Avito API
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Интеграция с официальным сервисом developers.avito.ru
            </p>
          </div>
        </div>

        {savedData ? (
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <CheckCircle2 color="#10b981" size={24} />
              <div>
                <div style={{ fontWeight: '700', color: '#34d399', fontSize: '14px' }}>
                  API Ключи сохранены
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Client ID: {savedData.clientId}
                </div>
                {savedData.customItemIds && (
                  <div style={{ fontSize: '11px', color: 'var(--primary-avito)', marginTop: '4px', wordBreak: 'break-all' }}>
                    ID объявлений: {savedData.customItemIds}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setSavedData(null)}
              >
                Изменить ключи / Список ID
              </button>
              <button
                onClick={handleDisconnect}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
              >
                <Trash2 size={16} />
                <span>Отключить API</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Client ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="Например: 2f8a91c0b3d4..."
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Client Secret</label>
              <input
                type="password"
                className="form-input"
                placeholder="Секретный ключ..."
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Список ID объявлений на Авито (через запятую или с новой строки)</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Например: 382910481, 492019283, 501920394..."
                value={customItemIds}
                onChange={(e) => setCustomItemIds(e.target.value)}
                style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                Вставьте списком ID ваших объявлений с сайта Авито для мгновенного забора статистики по всем позициям.
              </span>
            </div>

            <div style={{
              fontSize: '12px',
              color: 'var(--text-dim)',
              marginBottom: '24px',
              lineHeight: '1.5',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <Shield size={16} style={{ flexShrink: 0, marginTop: '2px' }} color="var(--primary-avito)" />
              <span>
                Ключи можно получить в личном кабинете Авито в разделе 
                <a href="https://www.avito.ru/profile/api" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-avito)', marginLeft: '4px' }}>
                  Для профессионалов → API <ExternalLink size={10} style={{ display: 'inline' }} />
                </a>. Ключи сохраняются локально в вашем браузере.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
                Отмена
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                Сохранить и Подключить
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
