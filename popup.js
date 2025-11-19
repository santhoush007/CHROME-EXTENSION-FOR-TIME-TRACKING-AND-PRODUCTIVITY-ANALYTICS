function updateTime() {
  chrome.storage.local.get('sessionTime', (data) => {
    const time = data.sessionTime || 0;
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    document.getElementById('currentTime').textContent = `Time: ${minutes}m ${seconds}s`;
  });
}

async function loadCategories() {
  const categories = await chrome.storage.local.get('categories');
  const container = document.getElementById('categories');
  container.innerHTML = '';
  if (categories.categories) {
    categories.categories.forEach(category => {
      const div = document.createElement('div');
      div.className = 'category';
      div.textContent = `${category.name}: ${category.type}`;
      container.appendChild(div);
    });
  }
}

document.getElementById('openDashboard').addEventListener('click', () => {
  chrome.tabs.create({ url: 'dashboard.html' });
});

updateTime();
loadCategories();
setInterval(updateTime, 1000);
