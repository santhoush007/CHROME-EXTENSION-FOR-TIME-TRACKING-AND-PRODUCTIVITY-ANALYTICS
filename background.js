let currentTabId = null;
let startTime = null;
let timeSpent = {};

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return url;
  }
}

async function classifyWebsite(domain) {
  const categories = await chrome.storage.local.get('categories');
  if (categories.categories) {
    for (const category of categories.categories) {
      if (category.domains.includes(domain)) {
        return category.type;
      }
    }
  }
  return 'neutral';
}

async function sendTimeData(domain, time, classification) {
  try {
    const response = await fetch('http://localhost:3000/api/time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain,
        time,
        classification,
        timestamp: new Date().toISOString(),
      }),
    });
    if (!response.ok) {
      console.error('Failed to send time data:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending time data:', error);
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  const domain = getDomain(tab.url);

  if (currentTabId && startTime) {
    const time = Date.now() - startTime;
    const classification = await classifyWebsite(getDomain(await chrome.tabs.get(currentTabId).url));
    timeSpent[currentTabId] = (timeSpent[currentTabId] || 0) + time;
    await sendTimeData(getDomain(await chrome.tabs.get(currentTabId).url), time, classification);
  }

  currentTabId = activeInfo.tabId;
  startTime = Date.now();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId === currentTabId && changeInfo.url) {
    const time = Date.now() - startTime;
    const classification = await classifyWebsite(getDomain(tab.url));
    timeSpent[tabId] = (timeSpent[tabId] || 0) + time;
    await sendTimeData(getDomain(tab.url), time, classification);
    startTime = Date.now();
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    if (currentTabId && startTime) {
      const time = Date.now() - startTime;
      const tab = await chrome.tabs.get(currentTabId);
      const classification = await classifyWebsite(getDomain(tab.url));
      timeSpent[currentTabId] = (timeSpent[currentTabId] || 0) + time;
      await sendTimeData(getDomain(tab.url), time, classification);
      startTime = null;
    }
  } else {
    const tabs = await chrome.tabs.query({ active: true, windowId });
    if (tabs.length > 0) {
      currentTabId = tabs[0].id;
      startTime = Date.now();
    }
  }
});

chrome.alarms.create('syncTime', { delayInMinutes: 1, periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'syncTime' && currentTabId && startTime) {
    const time = Date.now() - startTime;
    const tab = await chrome.tabs.get(currentTabId);
    const classification = await classifyWebsite(getDomain(tab.url));
    timeSpent[currentTabId] = (timeSpent[currentTabId] || 0) + time;
    await sendTimeData(getDomain(tab.url), time, classification);
    startTime = Date.now();
  }
});
