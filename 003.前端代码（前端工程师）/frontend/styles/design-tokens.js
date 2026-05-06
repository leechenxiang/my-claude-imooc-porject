/**
 * Financial Manager - Design Tokens
 * 基于 DESIGN.md 的设计系统配置
 */
module.exports = {
  // Colors - 樱花粉 + 薰衣草紫主题
  colors: {
    // Primary
    'primary': '#864e5a',
    'primary-dark': '#FF8FA3',
    'primary-light': '#FFB7C5',
    'primary-container': '#ffb7c5',
    'on-primary': '#ffffff',
    'on-primary-container': '#7b4551',

    // Semantic
    'income': '#7DD3C0',
    'expense': '#FFA09B',
    'success': '#10B981',
    'error': '#EF4444',

    // Surface - 奶油白主题
    'background': '#fbf9f8',
    'surface': '#fbf9f8',
    'surface-container': '#efeded',
    'surface-container-low': '#f5f3f3',
    'surface-container-high': '#eae8e7',
    'surface-container-lowest': '#ffffff',
    'pale-pink-white': '#FFF0F3',
    'cream-white': '#FFF9F5',

    // On Surface
    'on-surface': '#1b1c1c',
    'on-surface-variant': '#514345',

    // Outline
    'outline': '#837375',
    'outline-variant': '#d6c2c4',

    // Secondary
    'secondary': '#655781',
    'secondary-container': '#deccfd',
    'on-secondary': '#ffffff',
    'on-secondary-container': '#62547e',

    // Accent
    'accent': '#C9B8E8',
    'accent-light': '#E5D9F7',
  },

  // Typography - Plus Jakarta Sans
  fontFamily: {
    h1: ['Plus Jakarta Sans'],
    h2: ['Plus Jakarta Sans'],
    h3: ['Plus Jakarta Sans'],
    body: ['Plus Jakarta Sans'],
    'body-lg': ['Plus Jakarta Sans'],
    'body-md': ['Plus Jakarta Sans'],
    'body-sm': ['Plus Jakarta Sans'],
    label: ['Plus Jakarta Sans'],
    'label-md': ['Plus Jakarta Sans'],
    price: ['Plus Jakarta Sans'],
  },

  fontSize: {
    h1: ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
    h2: ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
    h3: ['20px', { lineHeight: '1.4', fontWeight: '600' }],
    'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
    'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
    'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
    'label-md': ['12px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '600' }],
    price: ['28px', { lineHeight: '1.1', fontWeight: '700' }],
  },

  // Border Radius
  borderRadius: {
    DEFAULT: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },

  // Spacing - 4px grid
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    margin: '20px',
    gutter: '16px',
  },

  // Shadows - 粉嫩柔和阴影
  shadow: {
    sm: '0 1px 2px rgba(134, 78, 90, 0.05)',
    DEFAULT: '0 4px 8px rgba(134, 78, 90, 0.08)',
    md: '0 8px 16px rgba(134, 78, 90, 0.12)',
    lg: '0 16px 24px rgba(134, 78, 90, 0.16)',
    primary: '0 8px 24px rgba(255, 183, 197, 0.4)',
  },

  // 分类图标映射
  categoryIcons: {
    expense: {
      meal: { icon: '🍚', name: '餐饮', color: '#FFD93D' },
      transport: { icon: '🚗', name: '交通', color: '#6BCB77' },
      shopping: { icon: '🛒', name: '购物', color: '#FF6B6B' },
      entertainment: { icon: '🎬', name: '娱乐', color: '#C9B8E8' },
      housing: { icon: '🏠', name: '住房', color: '#4D96FF' },
      medical: { icon: '💊', name: '医疗', color: '#FF8FA3' },
      communication: { icon: '📱', name: '通讯', color: '#95E1D3' },
      clothing: { icon: '👔', name: '服饰', color: '#F38181' },
      gift: { icon: '🎁', name: '人情', color: '#AA96DA' },
      other: { icon: '📦', name: '其他', color: '#A0A0A0' },
    },
    income: {
      salary: { icon: '💰', name: '工资', color: '#7DD3C0' },
      parttime: { icon: '💵', name: '兼职', color: '#95E1D3' },
      bonus: { icon: '🎯', name: '奖金', color: '#FFD93D' },
      gift: { icon: '🎁', name: '礼金', color: '#C9B8E8' },
      other: { icon: '📥', name: '其他', color: '#A0A0A0' },
    },
  },

  // 账户类型映射
  accountTypes: {
    cash: { icon: '💵', name: '现金' },
    wechat: { icon: '📱', name: '微信' },
    alipay: { icon: '🟢', name: '支付宝' },
    bank: { icon: '💳', name: '银行卡' },
  },
};