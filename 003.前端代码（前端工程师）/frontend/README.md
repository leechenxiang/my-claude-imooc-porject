# Financial Manager - 财务管家

> 基于 PRD V1.0.1 开发的财务管理Web应用

## 项目结构

```
frontend/
├── index.html                    # 入口页面/功能导航
├── pages/                     # 页面目录
│   ├── login.html            # 登录页
│   ├── register.html        # 注册页
│   ├── dashboard.html     # 首页/仪表板
│   ├── add_record.html   # 记一笔
│   ├── statistics.html  # 统计页
│   └── settings.html  # 设置页
├── styles/                   # 样式目录
│   ├── main.css           # 全局样式
│   └── design-tokens.js  # 设计Token
├── js/                     # 脚本目录
│   ├── app.js             # 核心应用（路由、存储、工具）
│   └── components/         # 组件
│       ├── bottom-nav.js   # 底部导航
│       └── navigation.js   # 导航组件
└── assets/                # 资源目录（图片等）
```

## 页面跳转

| 页面 | 功能 | 跳转 |
|------|------|------|
| login.html | 用户登录 | 成功→dashboard |
| register.html | 用户注册 | 成功→dashboard |
| dashboard.html | 首页 | +按钮→add_record |
| add_record.html | 记账 | 保存→dashboard |
| statistics.html | 统计 | 饼图+趋势图 |
| transaction_history.html | 明细 | 查看历史记录 |
| settings.html | 设置 | 退出登录→login |

## 技术栈

- **CSS**: Tailwind CSS
- **字体**: Plus Jakarta Sans
- **图标**: Material Symbols Outlined
- **存储**: localStorage

## 设计系统

- 主题：樱花粉（#FFB7C5）+ 薰衣草紫（#C9B8E8）
- 收入：薄荷绿（#7DD3C0）
- 支出：珊瑚红（#FFA09B）

## 开发说明

1. 打开 `index.html` 即可进入功能导航页
2. 各页面通过底部导航栏相互跳转
3. 数据存储在 localStorage，按用户隔离

## PRD参考

详细功能需求见 [PRD V1.0.1](../001.产品PRD（产品经理）/财务管家PRD-V1.0.1.md)