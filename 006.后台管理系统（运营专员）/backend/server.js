/**
 * 财务管家后台管理系统API服务
 * Node.js + Express + MySQL
 */

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'finance-manager-admin-secret-key-2026';

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'finance_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  }
}

// 获取管理员ID的辅助函数
async function getAdminIdFromToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.adminId;
}

// ==============================
// 通用API
// ==============================

app.get('/', (req, res) => {
  res.json({
    message: '财务管家后台管理系统 API',
    version: '1.0.0',
    status: 'running'
  });
});

// ==============================
// 管理员登录
// ==============================
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    const [admins] = await pool.execute(
      'SELECT id, username, password, nickname FROM admins WHERE username = ?',
      [username]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const admin = admins[0];
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const token = jwt.sign(
      { adminId: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        adminId: admin.id,
        username: admin.username,
        nickname: admin.nickname,
        token
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 验证Token
// ==============================
app.get('/api/admin/verify', async (req, res) => {
  try {
    const adminId = await getAdminIdFromToken(req);
    if (!adminId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const [admins] = await pool.execute(
      'SELECT id, username, nickname FROM admins WHERE id = ?',
      [adminId]
    );

    if (admins.length === 0) {
      return res.status(401).json({ success: false, message: '管理员不存在' });
    }

    const admin = admins[0];
    res.json({
      success: true,
      data: {
        adminId: admin.id,
        username: admin.username,
        nickname: admin.nickname
      }
    });

  } catch (error) {
    res.status(401).json({ success: false, message: 'Token无效' });
  }
});

// ==============================
// 数据概览
// ==============================
app.get('/api/admin/statistics/overview', async (req, res) => {
  try {
    const adminId = await getAdminIdFromToken(req);
    if (!adminId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    // 总用户数
    const [userCount] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const totalUsers = userCount[0].total;

    // 今日新增用户
    const [todayUsers] = await pool.execute(
      "SELECT COUNT(*) as total FROM users WHERE DATE(created_at) = CURDATE()"
    );
    const todayNewUsers = todayUsers[0].total;

    // 总交易笔数
    const [transactionCount] = await pool.execute('SELECT COUNT(*) as total FROM transactions');
    const totalTransactions = transactionCount[0].total;

    // 本月总收入
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const monthPrefix = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

    const [monthIncome] = await pool.execute(
      `SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t
       JOIN category_types ct ON t.type_id = ct.id
       WHERE ct.name = 'income' AND t.transaction_date LIKE ?`,
      [`${monthPrefix}%`]
    );
    const monthIncomeTotal = parseFloat(monthIncome[0].total);

    // 本月总支出
    const [monthExpense] = await pool.execute(
      `SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t
       JOIN category_types ct ON t.type_id = ct.id
       WHERE ct.name = 'expense' AND t.transaction_date LIKE ?`,
      [`${monthPrefix}%`]
    );
    const monthExpenseTotal = parseFloat(monthExpense[0].total);

    res.json({
      success: true,
      data: {
        totalUsers,
        todayNewUsers,
        totalTransactions,
        monthIncome: monthIncomeTotal,
        monthExpense: monthExpenseTotal,
        monthBalance: monthIncomeTotal - monthExpenseTotal,
        year: currentYear,
        month: currentMonth
      }
    });

  } catch (error) {
    console.error('获取数据概览错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 趋势数据（最近7天用户增长）
// ==============================
app.get('/api/admin/statistics/trend', async (req, res) => {
  try {
    const adminId = await getAdminIdFromToken(req);
    if (!adminId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    // 最近7天用户增长
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const [count] = await pool.execute(
        'SELECT COUNT(*) as total FROM users WHERE DATE(created_at) = ?',
        [dateStr]
      );

      trendData.push({
        date: dateStr,
        newUsers: count[0].total
      });
    }

    res.json({
      success: true,
      data: trendData
    });

  } catch (error) {
    console.error('获取趋势数据错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 用户排行
// ==============================
app.get('/api/admin/statistics/ranking', async (req, res) => {
  try {
    const adminId = await getAdminIdFromToken(req);
    if (!adminId) {
      return res.status(401).json({ success: false, message: '未��权' });
    }

    const year = req.query.year || new Date().getFullYear();

    // 支出最多的用户 TOP 10
    const [expenseRanking] = await pool.execute(
      `SELECT u.id, u.username, u.nickname, COALESCE(SUM(t.amount), 0) as total
       FROM users u
       LEFT JOIN transactions t ON u.id = t.user_id
       JOIN category_types ct ON t.type_id = ct.id
       WHERE ct.name = 'expense' AND t.transaction_date LIKE ?
       GROUP BY u.id
       ORDER BY total DESC
       LIMIT 10`,
      [`${year}%`]
    );

    // 收入最多的用户 TOP 10
    const [incomeRanking] = await pool.execute(
      `SELECT u.id, u.username, u.nickname, COALESCE(SUM(t.amount), 0) as total
       FROM users u
       LEFT JOIN transactions t ON u.id = t.user_id
       JOIN category_types ct ON t.type_id = ct.id
       WHERE ct.name = 'income' AND t.transaction_date LIKE ?
       GROUP BY u.id
       ORDER BY total DESC
       LIMIT 10`,
      [`${year}%`]
    );

    res.json({
      success: true,
      data: {
        expenseRanking: expenseRanking.map(u => ({
          ...u,
          total: parseFloat(u.total)
        })),
        incomeRanking: incomeRanking.map(u => ({
          ...u,
          total: parseFloat(u.total)
        }))
      }
    });

  } catch (error) {
    console.error('获取排行数据错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 全局收入支出统计
// ==============================
app.get('/api/admin/statistics/global', async (req, res) => {
  try {
    const adminId = await getAdminIdFromToken(req);
    if (!adminId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const year = req.query.year || new Date().getFullYear();

    // 年度收入
    const [yearIncome] = await pool.execute(
      `SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t
       JOIN category_types ct ON t.type_id = ct.id
       WHERE ct.name = 'income' AND t.transaction_date LIKE ?`,
      [`${year}%`]
    );

    // 年度支出
    const [yearExpense] = await pool.execute(
      `SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t
       JOIN category_types ct ON t.type_id = ct.id
       WHERE ct.name = 'expense' AND t.transaction_date LIKE ?`,
      [`${year}%`]
    );

    const yearIncomeTotal = parseFloat(yearIncome[0].total);
    const yearExpenseTotal = parseFloat(yearExpense[0].total);

    // 支出分类占比
    const [categoryStats] = await pool.execute(
      `SELECT c.id, c.name, c.icon, c.color, COALESCE(SUM(t.amount), 0) as total
       FROM categories c
       JOIN transactions t ON c.id = t.category_id
       JOIN category_types ct ON t.type_id = ct.id
       WHERE ct.name = 'expense' AND t.transaction_date LIKE ?
       GROUP BY c.id
       ORDER BY total DESC`,
      [`${year}%`]
    );

    // 月度趋势
    const monthlyData = [];
    for (let m = 1; m <= 12; m++) {
      const monthStr = m.toString().padStart(2, '0');
      const datePrefix = `${year}-${monthStr}`;

      const [monthIncome] = await pool.execute(
        `SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t
         JOIN category_types ct ON t.type_id = ct.id
         WHERE ct.name = 'income' AND t.transaction_date LIKE ?`,
        [datePrefix + '%']
      );

      const [monthExpense] = await pool.execute(
        `SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t
         JOIN category_types ct ON t.type_id = ct.id
         WHERE ct.name = 'expense' AND t.transaction_date LIKE ?`,
        [datePrefix + '%']
      );

      monthlyData.push({
        month: m,
        income: parseFloat(monthIncome[0].total),
        expense: parseFloat(monthExpense[0].total)
      });
    }

    res.json({
      success: true,
      data: {
        year,
        yearIncome: yearIncomeTotal,
        yearExpense: yearExpenseTotal,
        yearBalance: yearIncomeTotal - yearExpenseTotal,
        categoryStats: categoryStats.map(c => ({
          ...c,
          total: parseFloat(c.total)
        })),
        monthlyData
      }
    });

  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 用户列表
// ==============================
app.get('/api/admin/users', async (req, res) => {
  try {
    const adminId = await getAdminIdFromToken(req);
    if (!adminId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const search = req.query.search || '';
    const offset = (page - 1) * pageSize;

    let whereClause = '1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (u.username LIKE ? OR u.nickname LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // 获取用户列表
    const [users] = await pool.query(
      `SELECT u.id, u.username, u.nickname, u.avatar_url, u.theme, u.created_at
       FROM users u
       WHERE ${whereClause}
       ORDER BY u.id DESC
       LIMIT ${pageSize} OFFSET ${offset}`
    );

    // 获取总数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM users u WHERE ${whereClause}`,
      params
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / pageSize);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasMore: page < totalPages
        }
      }
    });

  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 用户详情
// ==============================
app.get('/api/admin/users/:id', async (req, res) => {
  try {
    const adminId = await getAdminIdFromToken(req);
    if (!adminId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const { id } = req.params;

    // 获取用户信息
    const [users] = await pool.execute(
      'SELECT id, username, nickname, avatar_url, theme, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    // 获取用户账户
    const [accounts] = await pool.execute(
      'SELECT a.id, a.name, a.icon, a.color, a.current_balance FROM accounts a WHERE a.user_id = ?',
      [id]
    );

    // 获取用户账本
    const [ledgers] = await pool.execute(
      'SELECT id, name, description, is_default FROM ledgers WHERE user_id = ?',
      [id]
    );

    // 获取交易统计
    const [transactionStats] = await pool.execute(
      `SELECT
        SUM(CASE WHEN ct.name = 'income' THEN t.amount ELSE 0 END) as totalIncome,
        SUM(CASE WHEN ct.name = 'expense' THEN t.amount ELSE 0 END) as totalExpense,
        COUNT(*) as totalCount
       FROM transactions t
       JOIN category_types ct ON t.type_id = ct.id
       WHERE t.user_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        user: users[0],
        accounts,
        ledgers,
        transactionStats: {
          totalIncome: parseFloat(transactionStats[0].totalIncome) || 0,
          totalExpense: parseFloat(transactionStats[0].totalExpense) || 0,
          totalCount: transactionStats[0].totalCount || 0
        }
      }
    });

  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 用户交易记录
// ==============================
app.get('/api/admin/users/:id/transactions', async (req, res) => {
  try {
    const adminId = await getAdminIdFromToken(req);
    if (!adminId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    // 获取用户交易记录
    const [transactions] = await pool.query(
      `SELECT t.id, t.amount, t.remark, t.transaction_date, t.created_at,
              c.name as category_name, c.icon as category_icon, c.color as category_color,
              ct.name as type_name, a.name as account_name, a.icon as account_icon
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       JOIN category_types ct ON t.type_id = ct.id
       JOIN accounts a ON t.account_id = a.id
       WHERE t.user_id = ${id}
       ORDER BY t.transaction_date DESC, t.id DESC
       LIMIT ${pageSize} OFFSET ${offset}`
    );

    // 获取总数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM transactions WHERE user_id = ${id}`
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / pageSize);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasMore: page < totalPages
        }
      }
    });

  } catch (error) {
    console.error('获取用户交易记录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 交易列表
// ==============================
app.get('/api/admin/transactions', async (req, res) => {
  try {
    const adminId = await getAdminIdFromToken(req);
    if (!adminId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const type = req.query.type; // expense, income
    const month = req.query.month; // 2026-04
    const userId = req.query.userId;
    const offset = (page - 1) * pageSize;

    // 构建WHERE条件
    let whereClause = '1=1';
    let queryParams = [];

    if (type && type !== 'all') {
      whereClause += ` AND ct.name = '${type}'`;
    }

    if (month) {
      whereClause += ` AND t.transaction_date LIKE '${month}%'`;
    }

    if (userId) {
      whereClause += ` AND t.user_id = ${userId}`;
    }

    // 获取交易列表
    const [transactions] = await pool.query(
      `SELECT t.id, t.amount, t.remark, t.transaction_date, t.created_at,
              c.name as category_name, c.icon as category_icon, c.color as category_color,
              ct.name as type_name, a.name as account_name, a.icon as account_icon,
              u.username as user_username, u.nickname as user_nickname
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       JOIN category_types ct ON t.type_id = ct.id
       JOIN accounts a ON t.account_id = a.id
       JOIN users u ON t.user_id = u.id
       WHERE ${whereClause}
       ORDER BY t.transaction_date DESC, t.id DESC
       LIMIT ${pageSize} OFFSET ${offset}`
    );

    // 获取总数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM transactions t
       JOIN category_types ct ON t.type_id = ct.id
       WHERE ${whereClause}`
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / pageSize);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasMore: page < totalPages
        }
      }
    });

  } catch (error) {
    console.error('获取交易列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 分类列表
// ==============================
app.get('/api/admin/categories', async (req, res) => {
  try {
    const adminId = await getAdminIdFromToken(req);
    if (!adminId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const type = req.query.type; // expense, income

    let whereClause = '1=1';
    const params = [];

    if (type) {
      whereClause += ' AND ct.name = ?';
      params.push(type);
    }

    const [categories] = await pool.execute(
      `SELECT c.id, c.name, c.icon, c.color, c.is_system, c.sort_order, ct.name as type_name
       FROM categories c
       JOIN category_types ct ON c.type_id = ct.id
       WHERE ${whereClause}
       ORDER BY ct.id, c.is_system DESC, c.sort_order`,
      params
    );

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 账户类型列表
// ==============================
app.get('/api/admin/account-types', async (req, res) => {
  try {
    const adminId = await getAdminIdFromToken(req);
    if (!adminId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const [accountTypes] = await pool.execute(
      'SELECT * FROM account_types ORDER BY id'
    );

    res.json({
      success: true,
      data: accountTypes
    });

  } catch (error) {
    console.error('获取账户类型错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 启动服务器
app.listen(PORT, async () => {
  console.log(`✅ 财务管家后台管理系统API已启动: http://localhost:${PORT}`);
  await testConnection();
});

module.exports = app;