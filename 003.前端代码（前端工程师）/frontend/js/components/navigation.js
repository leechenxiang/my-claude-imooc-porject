/**
 * Financial Manager - 导航组件
 * 提供页面导航功能
 */
class Navigation {
  constructor() {
    this.currentPage = 'dashboard';
    this.pages = [
      { name: 'dashboard', label: '首页', icon: 'home' },
      { name: 'statistics', label: '统计', icon: 'bar_chart' },
      { name: 'transaction-history', label: '明细', icon: 'receipt_long' },
      { name: 'settings', label: '设置', icon: 'settings' },
    ];
  }

  // 初始化导航
  init() {
    this.bindEvents();
    this.highlightCurrentPage();
  }

  // 绑定事件
  bindEvents() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page) {
          this.navigate(page);
        }
      });
    });
  }

  // 高亮当前页面
  highlightCurrentPage() {
    const path = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
      const page = item.dataset.page;
      if (page && path.includes(page)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // 导航到页面
  navigate(pageName) {
    const routes = {
      'login': '../pages/login.html',
      'register': '../pages/register.html',
      'dashboard': '../pages/dashboard.html',
      'statistics': '../pages/statistics.html',
      'transaction-history': '../pages/transaction_history.html',
      'settings': '../pages/settings.html',
    };

    const url = routes[pageName];
    if (url) {
      window.location.href = url;
    }
  }

  // 渲染底部导航
  render() {
    const navHtml = `
      <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-container flex justify-around py-3 pb-6 z-50">
        ${this.pages.map(page => `
          <button class="nav-item ${this.currentPage === page.name ? 'active' : ''}" data-page="${page.name}">
            <span class="material-symbols-outlined text-2xl">${page.icon}</span>
            <span>${page.label}</span>
          </button>
        `).join('')}
      </nav>
    `;
    return navHtml;
  }
}

// 导出
window.Navigation = Navigation;