import React, { useState, useEffect } from 'react';
import { Search, Send, CheckCheck, MessageSquare, Zap, RefreshCw, Loader2, Inbox } from 'lucide-react';
import { fetchAvitoChats, sendAvitoChatMessage } from '../services/avitoApi';

export default function ChatsView() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadRealChats = async () => {
    setIsLoading(true);
    try {
      const real = await fetchAvitoChats();
      if (real && real.length > 0) {
        setChats(real);
        setActiveChatId(real[0].id);
      } else {
        setChats([]);
        setActiveChatId(null);
      }
    } catch (e) {
      console.error(e);
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRealChats();
  }, []);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const quickTemplates = [
    '⚡ Товар в наличии, готовы оформить?',
    '🚚 Отправлю сегодня Авито Доставкой!',
    '📍 Адрес самовывоза: ул. Ленина 15 (с 10:00 до 20:00)',
    '💰 Сделаю скидку 5% при заказе прямо сейчас!'
  ];

  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || !activeChatId) return;

    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: text,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };

    setChats(prevChats => prevChats.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          unread: 0,
          lastTime: newMessage.time,
          messages: [...(c.messages || []), newMessage]
        };
      }
      return c;
    }));

    if (!textToSend) setInputMessage('');
    await sendAvitoChatMessage(activeChatId, text);
  };

  const filteredChats = chats.filter(c => {
    const matchesSearch = (c.user || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.itemTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnread = filterUnread ? c.unread > 0 : true;
    return matchesSearch && matchesUnread;
  });

  return (
    <div className="fade-in">
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
          <Loader2 className="animate-spin" size={36} color="var(--primary-avito)" />
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Загрузка чатов с сервера Авито...</span>
        </div>
      ) : chats.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(0, 170, 142, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            color: 'var(--primary-avito)'
          }}>
            <Inbox size={32} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
            У вас пока нет входящих диалогов на Авито
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
            Как только покупатели напишут по вашим объявлениям на Авито, чаты автоматически появятся в этом разделе в режиме реального времени.
          </p>
          <button className="btn-secondary" onClick={loadRealChats}>
            <RefreshCw size={14} />
            <span>Проверить новые сообщения</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', height: 'calc(100vh - 160px)', minHeight: '600px' }}>
          
          {/* Left Chat Threads Panel */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} color="var(--primary-avito)" />
                  Сообщения ({chats.length})
                </h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={loadRealChats}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    title="Обновить сообщения"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    onClick={() => setFilterUnread(!filterUnread)}
                    style={{
                      background: filterUnread ? 'rgba(0, 170, 142, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${filterUnread ? 'var(--primary-avito)' : 'var(--border-color)'}`,
                      color: filterUnread ? '#00aa8e' : 'var(--text-muted)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Непрочитанные
                  </button>
                </div>
              </div>

              <div className="search-input-box" style={{ width: '100%' }}>
                <Search size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Поиск по покупателю или товару..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Chat Items List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredChats.map(chat => {
                const lastMsg = chat.messages ? chat.messages[chat.messages.length - 1] : null;
                const isActive = chat.id === activeChatId;

                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
                    }}
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      gap: '12px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(0, 170, 142, 0.12)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--primary-avito)' : '3px solid transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img src={chat.avatar} alt={chat.user} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                      {chat.unread > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
                          background: '#ef4444',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: '800',
                          borderRadius: '10px',
                          padding: '2px 6px',
                          border: '2px solid var(--bg-dark)'
                        }}>
                          {chat.unread}
                        </span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {chat.user}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{chat.lastTime}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--primary-avito)', fontWeight: '600', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {chat.itemTitle}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lastMsg ? lastMsg.text : 'Диалог начат'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Active Conversation Area */}
          {activeChat && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Chat Header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(15, 23, 42, 0.6)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img src={activeChat.avatar} alt={activeChat.user} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {activeChat.user}
                      <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                        Покупатель
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Диалог по объявлению #{activeChat.id}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255, 255, 255, 0.04)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <img src={activeChat.itemImg || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100&auto=format&fit=crop&q=80'} alt={activeChat.itemTitle} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>{activeChat.itemTitle}</div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary-avito)' }}>{activeChat.itemPrice}</div>
                  </div>
                </div>
              </div>

              {/* Messages Body */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(9, 13, 22, 0.4)' }}>
                {(activeChat.messages || []).map((msg) => {
                  const isMe = msg.sender === 'me';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          padding: '12px 16px',
                          borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                          background: isMe 
                            ? 'linear-gradient(135deg, #00aa8e 0%, #008872 100%)' 
                            : 'rgba(30, 41, 59, 0.9)',
                          color: '#ffffff',
                          fontSize: '13px',
                          lineHeight: '1.5',
                          boxShadow: isMe ? '0 4px 15px rgba(0, 170, 142, 0.25)' : 'none',
                          border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)'
                        }}
                      >
                        {msg.text}
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {msg.time}
                        {isMe && <CheckCheck size={12} color="#00aa8e" />}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Quick Template Auto-Replies */}
              <div style={{ padding: '10px 20px', background: 'rgba(15, 23, 42, 0.8)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
                {quickTemplates.map((tmpl, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(tmpl)}
                    style={{
                      whiteSpace: 'nowrap',
                      background: 'rgba(0, 170, 142, 0.1)',
                      border: '1px solid rgba(0, 170, 142, 0.3)',
                      color: '#00aa8e',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Zap size={10} />
                    {tmpl}
                  </button>
                ))}
              </div>

              {/* Message Input Controls */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.9)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Напишите сообщение или выберите быстрый ответ..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" onClick={() => handleSendMessage()} style={{ padding: '12px 20px' }}>
                  <Send size={16} />
                  <span>Отправить</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
