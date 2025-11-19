let timeChart;
let productivityChart;

function formatTime(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

async function loadAnalytics() {
  try {
    const response = await fetch('http://localhost:3000/api/time/analytics?period=week');
    const data = await response.json();

    document.getElementById('totalProductive').textContent = formatTime(data.totalProductive);
    document.getElementById('totalUnproductive').textContent = formatTime(data.totalUnproductive);
    const totalTime = data.totalProductive + data.totalUnproductive;
    const ratio = totalTime > 0 ? Math.round((data.totalProductive / totalTime) * 100) : 0;
    document.getElementById('productivityRatio').textContent = `${ratio}%`;

    const domains = Object.keys(data.domainStats);
    const times = domains.map(domain => data.domainStats[domain].time);
    const classifications = domains.map(domain => data.domainStats[domain].classification);

    if (timeChart) timeChart.destroy();
    timeChart = new Chart(document.getElementById('timeChart'), {
      type: 'bar',
      data: {
        labels: domains,
        datasets: [{
          label: 'Time Spent (minutes)',
          data: times.map(t => Math.round(t / 60000)),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    const productiveTimes = classifications.map((c, i) => c === 'productive' ? times[i] : 0);
    const unproductiveTimes = classifications.map((c, i) => c === 'unproductive' ? times[i] : 0);

    if (productivityChart) productivityChart.destroy();
    productivityChart = new Chart(document.getElementById('productivityChart'), {
      type: 'pie',
      data: {
        labels: ['Productive', 'Unproductive'],
        datasets: [{
          data: [data.totalProductive, data.totalUnproductive],
          backgroundColor: ['#4CAF50', '#F44336'],
        }]
      },
      options: {
        responsive: true,
      }
    });

  } catch (error) {
    console.error('Error loading analytics:', error);
  }
}

async function loadCategories() {
  try {
    const response = await fetch('http://localhost:3000/api/categories');
    const categories = await response.json();
    const list = document.getElementById('categoryList');
    list.innerHTML = '';
    categories.forEach(category => {
      const li = document.createElement('li');
      li.className = 'category-item';
      li.innerHTML = `
        <span>${category.name} (${category.type}): ${category.domains.join(', ')}</span>
        <button onclick="deleteCategory(${category.id})">Delete</button>
      `;
      list.appendChild(li);
    });
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

document.getElementById('addCategory').addEventListener('click', async () => {
  const name = document.getElementById('categoryName').value;
  const type = document.getElementById('categoryType').value;
  const domains = document.getElementById('categoryDomains').value.split(',').map(d => d.trim());

  try {
    await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, domains }),
    });
    loadCategories();
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryDomains').value = '';
  } catch (error) {
    console.error('Error adding category:', error);
  }
});

async function deleteCategory(id) {
  try {
    await fetch(`http://localhost:3000/api/categories/${id}`, { method: 'DELETE' });
    loadCategories();
  } catch (error) {
    console.error('Error deleting category:', error);
  }
}

async function syncCategoriesToExtension() {
  try {
    const response = await fetch('http://localhost:3000/api/categories');
    const categories = await response.json();
  } catch (error) {
    console.error('Error syncing categories:', error);
  }
}

loadAnalytics();
loadCategories();
setInterval(loadAnalytics, 60000);
