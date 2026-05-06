/**
 * Financial Manager - 底部导航组件
 * 提供统一的底部导航功能
 */
class BottomNav {
  constructor() {
    this.items = [
      { id: 'dashboard', label: '首页', icon: 'home', href: 'dashboard.html' },
      { id: 'statistics', label: '统计', icon: 'bar_chart', href: 'statistics.html' },
      { id: 'add-record', label: '记一笔', icon: 'add_circle', href: 'add_record.html', isAction: true },
      { id: 'history', label: '明细', icon: 'receipt_long', href: 'transaction_history.html' },
      { id: 'settings', label: '设置', icon: 'settings', href: 'settings.html' },
    ];
  }

  render(activePage) {
    const navHtml = `
      <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EFEDED] flex justify-around py-3 pb-6 z-50">
        ${this.items.map(item => {
          if (item.isAction) {
            return `
              <a href="${item.href}" class="absolute left-1/2 -translate-x-1/2 -top-7">
                <div class="w-14 h-14 bg-gradient-to-r from-[#FFB7C5] to-[#FF8FA3] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                  <span class="material-symbols-outlined text-3xl text-white">add</span>
                </div>
              </a>
            `;
          }
          const isActive = activePage === item.id ? 'text-[#FF8FA3] bg-[#FFF0F3]' : 'text-[#8E8E8E]';
          return `
            <a href="${item.href}" class="flex flex-col items-center gap-1 px-3 py-1 rounded-xl ${isActive} transition-colors">
              <span class="material-symbols-outlined text-2xl">${item.icon}</span>
              <span class="text-xs">${item.label}</span>
            </a>
          `;
        }).join('')}
      </nav>
    `;
    return navHtml;
  }
}

// 导出
window.BottomNav = BottomNav;