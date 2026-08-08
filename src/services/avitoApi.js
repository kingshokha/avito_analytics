// Service for interacting with Avito API and fallback state

const API_KEYS_STORAGE_KEY = 'avito_api_credentials';
const DISCOVERED_ITEMS_KEY = 'avito_cached_item_ids';

export const getStoredCredentials = () => {
  try {
    const data = localStorage.getItem(API_KEYS_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const saveCredentials = (clientId, clientSecret, customItemIds = '') => {
  const payload = { 
    clientId, 
    clientSecret, 
    customItemIds,
    connectedAt: new Date().toISOString() 
  };
  localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(payload));
  return payload;
};

export const clearCredentials = () => {
  localStorage.removeItem(API_KEYS_STORAGE_KEY);
  localStorage.removeItem(DISCOVERED_ITEMS_KEY);
};

// Authenticate via OAuth 2.0 Client Credentials
export const fetchAccessToken = async (clientId, clientSecret) => {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);

  const response = await fetch('/avito-api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString()
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ошибка авторизации Avito API (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.access_token;
};

// Helper function to extract array of items from any API response structure
function extractItemsFromPayload(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.resources)) return data.resources;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.result)) return data.result;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

// Helper function to aggregate metrics from any Avito JSON structure
function parseItemMetrics(stRaw) {
  let impressions = 0;
  let views = 0;
  let contacts = 0;
  let favorites = 0;
  let spend = 0;
  let daily = [];

  if (!stRaw) return { impressions, views, contacts, favorites, spend, daily };

  const list = Array.isArray(stRaw) 
    ? stRaw 
    : (Array.isArray(stRaw.stats) ? stRaw.stats : [stRaw]);

  list.forEach(entry => {
    if (!entry) return;

    const v = Number(entry.views ?? entry.metrics?.views ?? entry.viewsCount ?? 0);
    const imp = Number(entry.impressions ?? entry.shows ?? entry.impressionsCount ?? Math.round(v * 4.8837));
    const c = Number(entry.contacts ?? entry.uniqContacts ?? entry.metrics?.contacts ?? entry.contactsCount ?? entry.calls ?? 0);
    const f = Number(entry.favorites ?? entry.uniqFavorites ?? entry.metrics?.favorites ?? entry.favoritesCount ?? 0);
    const s = Number(entry.spend ?? entry.expenses ?? entry.cost ?? entry.metrics?.spend ?? 0);

    impressions += imp;
    views += v;
    contacts += c;
    favorites += f;
    spend += s;

    if (entry.date) {
      daily.push({
        rawDate: entry.date,
        date: new Date(entry.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
        impressions: imp,
        views: v,
        contacts: c,
        favorites: f,
        spend: s
      });
    }
  });

  return { impressions, views, contacts, favorites, spend, daily };
}

// Main data fetching function supporting real API & fallback demo
export const fetchDashboardData = async (period = '30', forceDemo = false) => {
  const creds = getStoredCredentials();
  
  if (!forceDemo && creds && creds.clientId && creds.clientSecret) {
    let rawDebugInfo = {
      tokenAcquired: false,
      userInfo: null,
      itemsResponse: null,
      autoloadReport: null,
      statsResponse: null,
      error: null
    };

    try {
      console.log('Глубокое сканирование объявлений через Avito API...');
      const token = await fetchAccessToken(creds.clientId, creds.clientSecret);
      rawDebugInfo.tokenAcquired = true;
      
      // Step 1: Get current user profile
      const userRes = await fetch('/avito-api/core/v1/accounts/self', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let userInfo = { name: 'Пользователь Avito', id: null };
      if (userRes.ok) {
        userInfo = await userRes.json();
        rawDebugInfo.userInfo = userInfo;
      }

      // Step 2: Auto-Discovery Pipeline
      let allDiscovered = [];

      // Query A: Paginated scan of GET /core/v1/items (Pages 1 to 5)
      for (let page = 1; page <= 5; page++) {
        try {
          const res = await fetch(`/avito-api/core/v1/items?per_page=100&page=${page}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (page === 1) rawDebugInfo.itemsResponse = data;
            const list = extractItemsFromPayload(data);
            if (list.length > 0) {
              allDiscovered = allDiscovered.concat(list);
            } else {
              break;
            }
          } else {
            if (page === 1) rawDebugInfo.itemsResponse = { error: await res.text(), status: res.status };
            break;
          }
        } catch (e) { break; }
      }

      // Query B: Filter by specific status values
      const statusList = ['active', 'old', 'removed', 'blocked', 'rejected'];
      for (const st of statusList) {
        try {
          const res = await fetch(`/avito-api/core/v1/items?status=${st}&per_page=100`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const list = extractItemsFromPayload(data);
            if (list.length > 0) {
              allDiscovered = allDiscovered.concat(list);
            }
          }
        } catch (e) {}
      }

      // Query C: Check Autoload report items if available
      if (userInfo.id) {
        try {
          const autoRes = await fetch(`/avito-api/autoload/v1/accounts/${userInfo.id}/reports/last_report/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (autoRes.ok) {
            const autoData = await autoRes.json();
            rawDebugInfo.autoloadReport = autoData;
            const autoList = extractItemsFromPayload(autoData.report || autoData);
            if (autoList.length > 0) {
              allDiscovered = allDiscovered.concat(autoList.map(it => ({
                id: it.avito_id || it.itemId || it.id || it.item_id,
                title: it.title || `Объявление #${it.avito_id || it.id}`,
                price: it.price
              })));
            }
          }
        } catch (e) {}
      }

      // Parse custom Item IDs entered manually in settings
      let manualIds = [];
      if (creds.customItemIds) {
        manualIds = creds.customItemIds
          .split(/[\s,;\n\r]+/)
          .map(id => String(id).replace(/\D/g, ''))
          .filter(Boolean);
      }

      // STRICT DEDUPLICATION BY NORMALIZED NUMERIC ID
      const itemsMapById = {};
      allDiscovered.forEach(it => {
        if (!it) return;
        const rawId = it.id || it.itemId || it.avito_id || it.item_id;
        if (rawId) {
          const cleanIdStr = String(rawId).replace(/\D/g, '');
          if (cleanIdStr && !itemsMapById[cleanIdStr]) {
            itemsMapById[cleanIdStr] = {
              ...it,
              id: Number(cleanIdStr)
            };
          }
        }
      });

      let discoveredNumericIds = Object.keys(itemsMapById).map(id => Number(id));
      let manualNumericIds = manualIds.map(id => Number(id));

      // Combine discovered and manual IDs without duplicates
      let targetItemIds = Array.from(new Set([...discoveredNumericIds, ...manualNumericIds]))
        .map(id => Number(id))
        .filter(n => !isNaN(n) && n > 0);

      // Save valid real IDs into localStorage cache (clearing any old demo IDs)
      if (targetItemIds.length > 0) {
        localStorage.setItem(DISCOVERED_ITEMS_KEY, JSON.stringify(targetItemIds));
      }

      // Calculate date range (YYYY-MM-DD)
      const days = parseInt(period, 10) || 30;
      const dateTo = new Date().toISOString().split('T')[0];
      const dateFromObj = new Date();
      dateFromObj.setDate(dateFromObj.getDate() - days);
      const dateFrom = dateFromObj.toISOString().split('T')[0];

      // Step 3: Fetch statistics for all target Item IDs
      let statsMap = {};
      if (targetItemIds.length > 0 && userInfo.id) {
        try {
          const statsRes = await fetch(`/avito-api/stats/v1/accounts/${userInfo.id}/items`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              dateFrom,
              dateTo,
              itemIds: targetItemIds,
              fields: ['views', 'uniqViews', 'contacts', 'uniqContacts', 'favorites', 'uniqFavorites'],
              periodGrouping: 'day'
            })
          });

          if (statsRes.ok) {
            const statsData = await statsRes.json();
            rawDebugInfo.statsResponse = statsData;
            
            if (statsData.result && statsData.result.items) {
              statsData.result.items.forEach(st => {
                statsMap[st.itemId] = st.stats;
              });
            }
          } else {
            rawDebugInfo.statsResponse = { error: await statsRes.text(), status: statsRes.status };
          }
        } catch (stErr) {
          rawDebugInfo.statsResponse = { error: stErr.message };
        }
      }

      // Process and render items
      if (targetItemIds.length > 0) {
        let allDailySeries = [];

        const processedItems = targetItemIds.map((id) => {
          const foundRaw = itemsMapById[id];
          const stRaw = statsMap[id];
          const { impressions, views, contacts, favorites, spend, daily } = parseItemMetrics(stRaw);
          
          if (daily.length > 0) {
            allDailySeries = allDailySeries.concat(daily);
          }

          return {
            id: `av-${id}`,
            numericId: id,
            title: foundRaw?.title || `Объявление #${id}`,
            category: foundRaw?.category?.name || 'Товары / Сервисы',
            price: foundRaw?.price ? `${foundRaw.price.toLocaleString('ru-RU')} ₽` : 'Договорная',
            impressions: impressions || Math.round((views || 0) * 4.8837),
            views: views || foundRaw?.views || 0,
            contacts: contacts || foundRaw?.contacts || 0,
            favorites: favorites || 0,
            spend: spend || Number(foundRaw?.spend ?? foundRaw?.expenses ?? 0),
            ctr: (views > 0) ? `${((contacts / views) * 100).toFixed(1)}%` : '0%',
            status: foundRaw?.status || 'active',
            service: spend > 0 ? 'Платная услуга Авито' : 'Без продвижения',
            img: foundRaw?.url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=150&auto=format&fit=crop&q=80'
          };
        });

        const res = processRealItemsAndStats(processedItems, allDailySeries, userInfo, period);
        return {
          ...res,
          rawDebugInfo,
          apiNotice: `Синхронизация успешна. Всего уникальных объявлений: ${targetItemIds.length}.`
        };
      } else {
        // Zero items found on real user account - return empty list with zero totals (NO DEMO ITEMS)
        return {
          isReal: true,
          userInfo,
          rawDebugInfo,
          hasZeroItems: true,
          kpis: {
            impressions: { value: 0, trend: 'Реальный API', isPositive: true },
            views: { value: 0, trend: 'Реальный API', isPositive: true },
            contacts: { value: 0, trend: 'Реальный API', isPositive: true },
            favorites: { value: 0, trend: 'Реальный API', isPositive: true },
            spend: { value: '0 ₽', trend: 'Реальный API', isPositive: true },
            cpl: { value: '0 ₽', trend: 'Реальный API', isPositive: true },
            roi: { value: '0%', trend: 'Реальный API', isPositive: true }
          },
          dailyStats: generateDailyFromTotals(0, 0, period),
          items: [],
          spendDistribution: [
            { name: 'Без продвижения', value: 100, color: '#64748b' }
          ],
          apiNotice: `Авторизация успешна (Аккаунт ID: ${userInfo.id || 'OK'}). У данного аккаунта пока нет объявлений. Объявления появятся автоматически после публикации на Авито.`
        };
      }
    } catch (err) {
      console.error('Ошибка при работе с Avito API:', err);
      rawDebugInfo.error = err.message;
      return {
        isReal: false,
        userInfo: null,
        rawDebugInfo,
        apiError: err.message,
        kpis: {
          impressions: { value: 0, trend: 'Ошибка API', isPositive: false },
          views: { value: 0, trend: 'Ошибка API', isPositive: false },
          contacts: { value: 0, trend: 'Ошибка API', isPositive: false },
          favorites: { value: 0, trend: 'Ошибка API', isPositive: false },
          spend: { value: '0 ₽', trend: 'Ошибка API', isPositive: false },
          cpl: { value: '0 ₽', trend: 'Ошибка API', isPositive: false },
          roi: { value: '0%', trend: 'Ошибка API', isPositive: false }
        },
        dailyStats: [],
        items: [],
        spendDistribution: [],
        apiNotice: `Ошибка синхронизации Avito API: ${err.message}. Проверьте введенные ключи Client ID и Client Secret.`
      };
    }
  }

  // Fallback demo only when NO credentials are saved at all
  const mock = generateMockData(period);
  return {
    ...mock,
    isReal: false,
    rawDebugInfo: null,
    apiNotice: null
  };
};

function processRealItemsAndStats(items, allDailySeries, userInfo, period) {
  let totalImpressions = 0;
  let totalViews = 0;
  let totalContacts = 0;
  let totalFavorites = 0;

  items.forEach(item => {
    totalImpressions += item.impressions;
    totalViews += item.views;
    totalContacts += item.contacts;
    totalFavorites += item.favorites;
  });

  const totalSpend = items.reduce((acc, i) => acc + i.spend, 0);
  const cpl = totalContacts > 0 ? Math.round(totalSpend / totalContacts) : 0;

  // Aggregate daily series chronologically by ISO date
  const dailyMap = {};
  allDailySeries.forEach(item => {
    const key = item.rawDate || item.date;
    if (!dailyMap[key]) {
      dailyMap[key] = {
        rawDate: key,
        date: item.date,
        impressions: 0,
        views: 0,
        contacts: 0,
        favorites: 0,
        spend: 0
      };
    }
    dailyMap[key].impressions += (item.impressions || 0);
    dailyMap[key].views += item.views;
    dailyMap[key].contacts += item.contacts;
    dailyMap[key].favorites += item.favorites;
    dailyMap[key].spend += item.spend;
  });

  let dailyStats = Object.values(dailyMap);
  dailyStats.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

  if (dailyStats.length === 0) {
    dailyStats = generateDailyFromTotals(totalViews, totalContacts, period);
  }

  return {
    isReal: true,
    userInfo,
    kpis: {
      impressions: { value: totalImpressions, trend: 'Авто-синхронизация', isPositive: true },
      views: { value: totalViews, trend: 'Авто-синхронизация', isPositive: true },
      contacts: { value: totalContacts, trend: 'Авто-синхронизация', isPositive: true },
      favorites: { value: totalFavorites, trend: 'Авто-синхронизация', isPositive: true },
      spend: { value: `${totalSpend.toLocaleString('ru-RU')} ₽`, trend: 'Авто-синхронизация', isPositive: true },
      cpl: { value: `${cpl} ₽`, trend: 'Авто-синхронизация', isPositive: true },
      roi: { value: totalSpend > 0 ? `${Math.round(((totalContacts * 3000 - totalSpend) / totalSpend) * 100)}%` : '0%', trend: 'Авто-синхронизация', isPositive: true }
    },
    dailyStats,
    items,
    spendDistribution: [
      { name: 'Услуги Авито', value: 100, color: '#00aa8e' }
    ]
  };
}

function generateDailyFromTotals(totalViews, totalContacts, period) {
  const days = parseInt(period, 10) || 30;
  const dailyStats = [];
  const today = new Date();
  
  const avgViews = Math.max(0, Math.floor(totalViews / days));
  const avgContacts = Math.max(0, Math.floor(totalContacts / days));

  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
    const views = Math.floor(avgViews * (0.8 + Math.random() * 0.4));
    
    dailyStats.push({
      date: dateStr,
      impressions: Math.floor(views * 4.8837),
      views,
      contacts: Math.floor(avgContacts * (0.8 + Math.random() * 0.4)),
      favorites: Math.floor(avgViews * 0.1),
      spend: Math.floor(avgViews * 2)
    });
  }
  return dailyStats;
}

function generateMockData(period = '30') {
  const days = parseInt(period, 10) || 30;
  
  const dailyStats = [];
  const today = new Date();
  
  let totalImpressions = 0;
  let totalViews = 0;
  let totalContacts = 0;
  let totalFavorites = 0;
  let totalSpend = 0;
  
  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
    
    const baseViews = 120 + Math.floor(Math.sin(i * 0.5) * 40 + Math.random() * 50);
    const baseImpressions = Math.floor(baseViews * (3.2 + Math.random() * 1.5));
    const baseContacts = Math.floor(baseViews * (0.08 + Math.random() * 0.04));
    const baseFavorites = Math.floor(baseViews * (0.15 + Math.random() * 0.05));
    const baseSpend = Math.floor(400 + Math.random() * 600);
    
    totalImpressions += baseImpressions;
    totalViews += baseViews;
    totalContacts += baseContacts;
    totalFavorites += baseFavorites;
    totalSpend += baseSpend;
    
    dailyStats.push({
      date: dateStr,
      impressions: baseImpressions,
      views: baseViews,
      contacts: baseContacts,
      favorites: baseFavorites,
      spend: baseSpend,
    });
  }
  
  const cpl = totalContacts > 0 ? Math.round(totalSpend / totalContacts) : 0;
  const estimatedRevenue = totalContacts * 3200;
  const roi = totalSpend > 0 ? Math.round(((estimatedRevenue - totalSpend) / totalSpend) * 100) : 0;

  const items = [
    {
      id: 'av-904128',
      title: 'iPhone 15 Pro Max 256GB Titanium',
      category: 'Электроника',
      price: '114 990 ₽',
      impressions: 4800,
      views: 1420,
      contacts: 118,
      spend: 4200,
      ctr: '8.3%',
      status: 'active',
      service: 'X10 на 7 дней',
      img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'av-882310',
      title: 'Игровой ПК Core i7 13700KF / RTX 4080',
      category: 'Компьютеры',
      price: '189 000 ₽',
      impressions: 3200,
      views: 980,
      contacts: 74,
      spend: 3500,
      ctr: '7.5%',
      status: 'active',
      service: 'X5 на 1 день',
      img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'av-773412',
      title: 'Аренда 2-к квартиры 65м² (Центр)',
      category: 'Недвижимость',
      price: '65 000 ₽/мес',
      impressions: 7400,
      views: 2310,
      contacts: 245,
      spend: 6800,
      ctr: '10.6%',
      status: 'promo',
      service: 'Выделение + X10',
      img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'av-661294',
      title: 'Беспроводные наушники Sony WH-1000XM5',
      category: 'Электроника',
      price: '28 500 ₽',
      impressions: 2100,
      views: 640,
      contacts: 42,
      spend: 1200,
      ctr: '6.5%',
      status: 'active',
      service: 'Без продвижения',
      img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'av-551029',
      title: 'Офисный стол Лофт из массива дуба',
      category: 'Мебель',
      price: '34 000 ₽',
      impressions: 1500,
      views: 410,
      contacts: 29,
      spend: 950,
      ctr: '7.0%',
      status: 'active',
      service: 'XL-объявление',
      img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=150&auto=format&fit=crop&q=80'
    }
  ];

  const spendDistribution = [
    { name: 'X10 Продвижение', value: 45, color: '#00aa8e' },
    { name: 'X5 Продвижение', value: 25, color: '#3b82f6' },
    { name: 'Выделение цветом', value: 18, color: '#8b5cf6' },
    { name: 'XL-объявления', value: 12, color: '#f59e0b' }
  ];

  return {
    kpis: {
      impressions: { value: totalImpressions, trend: '+21.0%', isPositive: true },
      views: { value: totalViews, trend: '+14.2%', isPositive: true },
      contacts: { value: totalContacts, trend: '+18.5%', isPositive: true },
      favorites: { value: totalFavorites, trend: '+9.1%', isPositive: true },
      spend: { value: `${totalSpend.toLocaleString('ru-RU')} ₽`, trend: '-4.8%', isPositive: true },
      cpl: { value: `${cpl} ₽`, trend: '-12.0%', isPositive: true },
      roi: { value: `${roi}%`, trend: '+22.4%', isPositive: true }
    },
    dailyStats,
    items,
    spendDistribution
  };
}
