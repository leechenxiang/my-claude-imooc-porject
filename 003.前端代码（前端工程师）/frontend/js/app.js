/**
 * Financial Manager - Core Utilities
 * 核心功能：路由、数据存储、工具函数
 */

// ============ 路由管理 ============
const Router = {
  // 页面映射
  pages: {
    'login': '/pages/login.html',
    'register': '/pages/register.html',
    'dashboard': '/pages/dashboard.html',
    'add-record': '/pages/add_record.html',
    'statistics': '/pages/statistics.html',
    'transaction-history': '/pages/transaction_history.html',
    'settings': '/pages/settings.html',
  },

  // 页面名称映射（中文）
  pageNames: {
    'login': '登录',
    'register': '注册',
    'dashboard': '首页',
    'add-record': '记账',
    'statistics': '统计',
    'transaction-history': '明细',
    'settings': '设置',
  },

  // 导航到指定页面
  navigate(pageName) {
    const page = this.pages[pageName];
    if (page) {
      window.location.href = page;
    }
  },

  // 获取当前页面名称
  getCurrentPage() {
    const path = window.location.pathname;
    for (const [name, url] of Object.entries(this.pages)) {
      if (path.includes(name)) {
        return name;
      }
    }
    return 'dashboard';
  },
};

// ============ 本地存储管理 ============
const Storage = {
  // 用户数据键前缀
  prefix: 'finance_',

  // 获取用户数据Key
  getUserDataKey(key, username) {
    return this.prefix + 'data_' + (username || this.getCurrentUsername()) + '_' + key;
  },

  // 获取当前用户名
  getCurrentUsername() {
    return localStorage.getItem(this.prefix + 'currentUser');
  },

  // 检查是否已登录
  isLoggedIn() {
    const user = this.getCurrentUsername();
    return !!user;
  },

  // 获取所有用户
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.prefix + 'users') || {};
    } catch {
      return {};
    }
  },

  // 保存用户列表
  saveUsers(users) {
    localStorage.setItem(this.prefix + 'users', JSON.stringify(users));
  },

  // 加载用户数据
  loadUserData(key) {
    try {
      const data = localStorage.getItem(this.getUserDataKey(key));
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // 保存用户数据
  saveUserData(key, data) {
    localStorage.setItem(this.getUserDataKey(key), JSON.stringify(data));
  },

  // 清除当前用户会话
  clearSession() {
    localStorage.removeItem(this.prefix + 'currentUser');
  },
};

// ============ 密码加密 ============
const Auth = {
  // 简易哈希（生产环境应使用bcrypt等更强加密）
  hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  },

  // 注册
  register(username, password) {
    const users = Storage.getUsers();
    if (users[username]) {
      return { success: false, error: '用户名已存在' };
    }
    users[username] = {
      password: this.hash(password),
      created: new Date().toISOString(),
    };
    Storage.saveUsers(users);
    return { success: true };
  },

  // 登录
  login(username, password) {
    const users = Storage.getUsers();
    const user = users[username];
    if (!user || user.password !== this.hash(password)) {
      return { success: false, error: '用户名或密码错误' };
    }
    localStorage.setItem(Storage.prefix + 'currentUser', username);
    return { success: true };
  },

  // 登出
  logout() {
    Storage.clearSession();
    Router.navigate('login');
  },

  // 检查登录状态
  checkAuth() {
    if (!Storage.isLoggedIn()) {
      Router.navigate('login');
      return false;
    }
    return true;
  },
};

// ============ 数据模型 ============
const Model = {
  // 默认账户
  defaultAccounts: [
    { id: 1, name: '现金', type: 'cash', icon: '💵', balance: 0 },
    { id: 2, name: '微信支付', type: 'wechat', icon: '📱', balance: 0 },
    { id: 3, name: '支付宝', type: 'alipay', icon: '🟢', balance: 0 },
  ],

  // 默认数据
  getDefaultData() {
    return {
      transactions: [],
      accounts: [...this.defaultAccounts],
    };
  },

  // 加载数据
  loadData() {
    let transactions = Storage.loadUserData('transactions');
    let accounts = Storage.loadUserData('accounts');

    if (!transactions) {
      transactions = [];
    }
    if (!accounts || accounts.length === 0) {
      accounts = [...this.defaultAccounts];
    }

    return { transactions, accounts };
  },

  // 保存数据
  saveData(key, data) {
    Storage.saveUserData(key, data);
  },
};

// ============ 工具函数 ============
const Utils = {
  // 格式化金额
  formatMoney(amount) {
    return '¥' + Math.abs(amount).toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  },

  // 格式化日期
  formatDate(date, format = 'short') {
    const d = new Date(date);
    if (format === 'short') {
      return d.getMonth() + 1 + '/' + d.getDate();
    }
    if (format === 'full') {
      return d.toLocaleDateString('zh-CN');
    }
    return d.toLocaleString('zh-CN');
  },

  // 生成ID
  generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  },

  // Toast提示
  showToast(message, type = '') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast' + (type ? ' ' + type : '');
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => toast.classList.remove('show'), 3000);
  },

  // 获取当月时间范围
  getCurrentMonthRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
  },

  // 筛选当月数据
  filterCurrentMonth(transactions) {
    const { start, end } = this.getCurrentMonthRange();
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
  },

  // 计算收支汇总
  calculateSummary(transactions) {
    const monthTransactions = this.filterCurrentMonth(transactions);
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  },

  // 按分类汇总
  aggregateByCategory(transactions, type = 'expense') {
    const filtered = transactions.filter(t => t.type === type);
    const totals = {};
    filtered.forEach(t => {
      if (!totals[t.category]) {
        totals[t.category] = 0;
      }
      totals[t.category] += t.amount;
    });
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1]);
  },
};

// ============ 页面跳转辅助 ============
function navigateTo(pageName) {
  Router.navigate(pageName);
}

// 导出全局使用
window.App = {
  Router,
  Storage,
  Auth,
  Model,
  Utils,
  navigateTo,
};