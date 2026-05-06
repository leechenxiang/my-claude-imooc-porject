# AGENTS.md

本文件为 Codex (Codex.ai/code) 在此代码库中工作提供指导。

## 项目概述

此项目包含一个名为"财务管家"的个人财务管理网页应用。它是一个单页HTML应用，无需构建系统。

## 项目结构

```
├── 财务管家.html          # 主应用文件（单页HTML应用）
└── 001.产品PRD（产品经理）/
    └── 财务管家PRD-V1.0.md  # 产品需求文档
```

## 开发命令

由于这是纯HTML文件，无需构建流程。

- **查看应用**：直接在现代浏览器（Chrome、Safari、Edge）中打开 `财务管家.html`
- **测试更改**：保存HTML文件后刷新浏览器即可
- **本地服务器**（可选）：为了更好的开发体验，可在本地提供服务：
  ```bash
  npx serve .
  # 或
  python -m http.server 8000
  ```

## 架构

### 技术栈
- **前端**：原生HTML/CSS/JavaScript（无框架）
- **图表**：Chart.js（从CDN加载）
- **存储**：浏览器localStorage用于数据持久化
- **字体**：Google Fonts（Noto Sans SC、ZCOOL KuaiLe、DM Sans）

### 核心功能
- 快速记账（支持分类）
- 分类管理（支出/收入）
- 账户管理
- 月度统计（图表展示）
- Excel/CSV导出

### 设计系统
- **主题**：粉嫩可爱风格
- **主色**：樱花粉 #FFB7C5、玫瑰粉 #FF8FA3
- **收入**：薄荷绿 #7DD3C0
- **支出**：珊瑚红 #FFA09B
- **强调色**：薰衣草紫 #C9B8E8

### 数据模型
```javascript
// 交易记录
{
  id: string,
  type: 'expense' | 'income',  // 支出或收入
  category: string,            // 分类ID
  amount: number,            // 金额
  account: number,          // 账户ID
  remark: string,          // 备注
  date: ISO string         // 日期
}

// 账户
{
  id: number,
  name: string,           // 账户名称
  type: string,          // 账户类型
  icon: emoji,          // 图标
  balance: number       // 余额
}
```

## 开发注意事项

- 所有代码都包含在单个 `财务管家.html` 文件中（约48KB）
- 数据存储在浏览器localStorage的 `financeData` 键下
- 使用CSS自定义属性（变量）进行主题管理
- 通过 `prefers-color-scheme` 媒体查询支持暗色模式
- 移动端优先的响应式设计（最大宽度480px）