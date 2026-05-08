/**
 * 财务管家后端API服务
 * Node.js + Express + MySQL
 */

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'finance-manager-secret-key-2026';

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

// 获取用户ID的辅助函数
async function getUserIdFromToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.userId;
}

// ==============================
// 通用API
// ==============================

app.get('/', (req, res) => {
  res.json({
    message: '财务管家 API 服务',
    version: '1.0.0',
    status: 'running'
  });
});

// ==============================
// 用户注册
// ==============================
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
      [username, hashedPassword, nickname || username]
    );

    const userId = result.insertId;

    await pool.execute(
      'INSERT INTO ledgers (user_id, name, description, is_default) VALUES (?, ?, ?, ?)',
      [userId, '默认账本', '我的第一个账本', 1]
    );

    const [ledger] = await pool.execute(
      'SELECT id FROM ledgers WHERE user_id = ? AND is_default = 1',
      [userId]
    );

    const ledgerId = ledger[0].id;
    const accountTypes = [
      { name: '现金', icon: '💵', color: '#FFB7C5' },
      { name: '微信支付', icon: '📱', color: '#7DD3C0' },
      { name: '支付宝', icon: '🟢', color: '#FF8FA3' }
    ];

    for (const type of accountTypes) {
      const [typeResult] = await pool.execute(
        'SELECT id FROM account_types WHERE name = ?',
        [type.name]
      );
      if (typeResult.length > 0) {
        await pool.execute(
          'INSERT INTO accounts (ledger_id, user_id, type_id, name, icon, color, initial_balance, current_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [ledgerId, userId, typeResult[0].id, type.name, type.icon, type.color, 0, 0]
        );
      }
    }

    const token = jwt.sign(
      { userId, username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: { userId, username, nickname: nickname || username, token }
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 用户登录
// ==============================
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    const [users] = await pool.execute(
      'SELECT id, username, password, nickname, avatar_url, theme FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const [ledgers] = await pool.execute(
      'SELECT id, name, description, is_default FROM ledgers WHERE user_id = ?',
      [user.id]
    );

    const [accounts] = await pool.execute(
      'SELECT id, name, icon, color, current_balance FROM accounts WHERE user_id = ?',
      [user.id]
    );

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        userId: user.id,
        username: user.username,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        theme: user.theme,
        token,
        ledgers,
        accounts
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
app.get('/api/verify', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const [users] = await pool.execute(
      'SELECT id, username, nickname, avatar_url, theme FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: '用户不存在' });
    }

    const user = users[0];
    res.json({
      success: true,
      data: {
        userId: user.id,
        username: user.username,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        theme: user.theme
      }
    });

  } catch (error) {
    res.status(401).json({ success: false, message: 'Token无效' });
  }
});

// ==============================
// 获取用户信息
// ==============================
app.get('/api/user', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const [users] = await pool.execute(
      'SELECT id, username, nickname, avatar_url, theme, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({ success: true, data: users[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 更新用户信息（头像）
// ==============================
app.put('/api/user', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const { nickname, avatar_url, theme } = req.body;

    await pool.execute(
      'UPDATE users SET nickname = COALESCE(?, nickname), avatar_url = COALESCE(?, avatar_url), theme = COALESCE(?, theme) WHERE id = ?',
      [nickname, avatar_url, theme, userId]
    );

    res.json({ success: true, message: '更新成功' });

  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 获取账户列表
// ==============================
app.get('/api/accounts', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const [accounts] = await pool.execute(
      'SELECT a.*, at.name as type_name, at.icon as type_icon FROM accounts a LEFT JOIN account_types at ON a.type_id = at.id WHERE a.user_id = ? ORDER BY a.sort_order',
      [userId]
    );

    res.json({ success: true, data: accounts });

  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 添加账户
// ==============================
app.post('/api/accounts', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const { name, icon, color, type_id, initial_balance } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: '账户名称不能为空' });
    }

    const [ledger] = await pool.execute(
      'SELECT id FROM ledgers WHERE user_id = ? AND is_default = 1',
      [userId]
    );

    if (ledger.length === 0) {
      return res.status(400).json({ success: false, message: '账本不存在' });
    }

    const ledgerId = ledger[0].id;
    const accountTypeId = type_id || 1;
    const accountColor = color || '#FFB7C5';

    const [result] = await pool.execute(
      'INSERT INTO accounts (ledger_id, user_id, type_id, name, icon, color, initial_balance, current_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [ledgerId, userId, accountTypeId, name, icon, accountColor, initial_balance || 0, initial_balance || 0]
    );

    res.json({ success: true, message: '添加成功', data: { id: result.insertId } });

  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 更新账户
// ==============================
app.put('/api/accounts/:id', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const { id } = req.params;
    const { name, icon, color, type_id } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: '账户名称不能为空' });
    }

    const accountColor = color || '#FFB7C5';
    const accountTypeId = type_id || 1;

    await pool.execute(
      'UPDATE accounts SET name = ?, icon = ?, color = ?, type_id = ? WHERE id = ? AND user_id = ?',
      [name, icon, accountColor, accountTypeId, id, userId]
    );

    res.json({ success: true, message: '更新成功' });

  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 删除账户
// ==============================
app.delete('/api/accounts/:id', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const { id } = req.params;

    await pool.execute(
      'DELETE FROM accounts WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ success: true, message: '删除成功' });

  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 获取分类列表
// ==============================
app.get('/api/categories', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const type = req.query.type;

    let query = 'SELECT c.* FROM categories c WHERE (c.user_id = ? OR c.user_id IS NULL)';
    const params = [userId];

    if (type) {
      const [typeResult] = await pool.execute(
        'SELECT id FROM category_types WHERE name = ?',
        [type]
      );

      if (typeResult.length > 0) {
        query += ' AND c.type_id = ?';
        params.push(typeResult[0].id);
      }
    }

    query += ' ORDER BY c.is_system DESC, c.sort_order';

    const [categories] = await pool.execute(query, params);

    res.json({ success: true, data: categories });

  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 添加分类
// ==============================
app.post('/api/categories', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const { name, icon, color, type } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: '分类名称不能为空' });
    }

    const [typeResult] = await pool.execute(
      'SELECT id FROM category_types WHERE name = ?',
      [type]
    );

    if (typeResult.length === 0) {
      return res.status(400).json({ success: false, message: '无效的分类类型' });
    }

    const typeId = typeResult[0].id;
    const categoryColor = color || '#FFB7C5';

    const [result] = await pool.execute(
      'INSERT INTO categories (user_id, type_id, name, icon, color, is_system) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, typeId, name, icon, categoryColor, 0]
    );

    res.json({ success: true, message: '添加成功', data: { id: result.insertId } });

  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 更新分类
// ==============================
app.put('/api/categories/:id', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const { id } = req.params;
    const { name, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: '分类名称不能为空' });
    }

    const categoryColor = color || '#FFB7C5';

    await pool.execute(
      'UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ? AND user_id = ?',
      [name, icon, categoryColor, id, userId]
    );

    res.json({ success: true, message: '更新成功' });

  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 删除分类
// ==============================
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const { id } = req.params;

    await pool.execute(
      'DELETE FROM categories WHERE id = ? AND user_id = ? AND is_system = 0',
      [id, userId]
    );

    res.json({ success: true, message: '删除成功' });

  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 添加交易记录
// ==============================
app.post('/api/transactions', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const { type, category_id, account_id, amount, remark, date } = req.body;

    if (!category_id || !account_id || !amount) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }

    const [ledger] = await pool.execute(
      'SELECT id FROM ledgers WHERE user_id = ? AND is_default = 1',
      [userId]
    );

    if (ledger.length === 0) {
      return res.status(400).json({ success: false, message: '账本不存在' });
    }

    const ledgerId = ledger[0].id;

    const [categoryCheck] = await pool.execute(
      'SELECT id, type_id FROM categories WHERE id = ?',
      [category_id]
    );

    if (categoryCheck.length === 0) {
      return res.status(400).json({ success: false, message: '分类不存在' });
    }

    const [accountCheck] = await pool.execute(
      'SELECT id FROM accounts WHERE id = ? AND user_id = ?',
      [account_id, userId]
    );

    if (accountCheck.length === 0) {
      return res.status(400).json({ success: false, message: '账户不存在' });
    }

    const typeId = categoryCheck[0].type_id;

    // 处理日期：确保是 YYYY-MM-DD 格式
    let transactionDate = date;
    if (transactionDate) {
      // 如果是ISO格式，提取日期部分
      if (transactionDate.includes('T')) {
        transactionDate = transactionDate.split('T')[0];
      }
    } else {
      transactionDate = new Date().toISOString().split('T')[0];
    }

    const [result] = await pool.execute(
      'INSERT INTO transactions (ledger_id, user_id, account_id, category_id, type_id, amount, remark, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [ledgerId, userId, account_id, category_id, typeId, amount, remark, transactionDate]
    );

    res.json({ success: true, message: '添加成功', data: { id: result.insertId } });

  } catch (error) {
    console.error('添加交易记录错误:', error.message);
    res.status(500).json({ success: false, message: '服务器错误: ' + error.message });
  }
});

// ==============================
// 获取首页数据
// ==============================
app.get('/api/home', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || (new Date().getMonth() + 1);
    const monthStr = month.toString().padStart(2, '0');
    const datePrefix = `${year}-${monthStr}`;

    // 获取本月收入
    const [incomeResult] = await pool.execute(
      `SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t
       JOIN category_types ct ON t.type_id = ct.id
       WHERE t.user_id = ? AND ct.name = 'income' AND t.transaction_date LIKE ?`,
      [userId, `${datePrefix}%`]
    );

    // 获取本月支出
    const [expenseResult] = await pool.execute(
      `SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t
       JOIN category_types ct ON t.type_id = ct.id
       WHERE t.user_id = ? AND ct.name = 'expense' AND t.transaction_date LIKE ?`,
      [userId, `${datePrefix}%`]
    );

    const income = parseFloat(incomeResult[0].total);
    const expense = parseFloat(expenseResult[0].total);
    const balance = income - expense;

    // 获取支出最多的3个分类
    const [topCategories] = await pool.execute(
      `SELECT c.id, c.name, c.icon, c.color, COALESCE(SUM(t.amount), 0) as total
       FROM categories c
       JOIN transactions t ON c.id = t.category_id
       JOIN category_types ct ON t.type_id = ct.id
       WHERE t.user_id = ? AND ct.name = 'expense' AND t.transaction_date LIKE ?
       GROUP BY c.id
       ORDER BY total DESC
       LIMIT 3`,
      [userId, `${datePrefix}%`]
    );

    // 获取最近3条记录（按created_at排序）
    const [recentTransactions] = await pool.execute(
      `SELECT t.id, t.amount, t.remark, t.transaction_date, t.created_at, c.name as category_name, c.icon as category_icon, ct.name as type_name
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       JOIN category_types ct ON t.type_id = ct.id
       WHERE t.user_id = ? AND t.transaction_date LIKE ?
       ORDER BY t.created_at DESC
       LIMIT 3`,
      [userId, `${datePrefix}%`]
    );

    res.json({
      success: true,
      data: {
        year,
        month,
        income,
        expense,
        balance,
        topCategories,
        recentTransactions
      }
    });

  } catch (error) {
    console.error('获取首页数据错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 获取统计页面数据
// ==============================
app.get('/api/statistics', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const year = req.query.year || new Date().getFullYear();

    // 年度收入
    const [incomeResult] = await pool.execute(
      `SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t
       JOIN category_types ct ON t.type_id = ct.id
       WHERE t.user_id = ? AND ct.name = 'income' AND t.transaction_date LIKE ?`,
      [userId, `${year}%`]
    );

    // 年度支出
    const [expenseResult] = await pool.execute(
      `SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t
       JOIN category_types ct ON t.type_id = ct.id
       WHERE t.user_id = ? AND ct.name = 'expense' AND t.transaction_date LIKE ?`,
      [userId, `${year}%`]
    );

    const yearIncome = parseFloat(incomeResult[0].total);
    const yearExpense = parseFloat(expenseResult[0].total);
    const yearBalance = yearIncome - yearExpense;

    // 支出分类统计（饼图）
    const [categoryStats] = await pool.execute(
      `SELECT c.id, c.name, c.icon, c.color, COALESCE(SUM(t.amount), 0) as total
       FROM categories c
       JOIN transactions t ON c.id = t.category_id
       JOIN category_types ct ON t.type_id = ct.id
       WHERE t.user_id = ? AND ct.name = 'expense' AND t.transaction_date LIKE ?
       GROUP BY c.id
       ORDER BY total DESC`,
      [userId, `${year}%`]
    );

    // 月度趋势（1-12月）
    const monthlyData = [];
    for (let m = 1; m <= 12; m++) {
      const monthStr = m.toString().padStart(2, '0');
      const datePrefix = `${year}-${monthStr}`;

      const [monthIncome] = await pool.execute(
        `SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t
         JOIN category_types ct ON t.type_id = ct.id
         WHERE t.user_id = ? AND ct.name = 'income' AND t.transaction_date LIKE ?`,
        [userId, `${datePrefix}%`]
      );

      const [monthExpense] = await pool.execute(
        `SELECT COALESCE(SUM(t.amount), 0) as total FROM transactions t
         JOIN category_types ct ON t.type_id = ct.id
         WHERE t.user_id = ? AND ct.name = 'expense' AND t.transaction_date LIKE ?`,
        [userId, `${datePrefix}%`]
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
        yearIncome,
        yearExpense,
        yearBalance,
        categoryStats,
        monthlyData
      }
    });

  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 获取交易明细列表
// ==============================
app.get('/api/transactions', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const type = req.query.type; // expense, income, all
    const month = req.query.month; // 2026-04

    const offset = (page - 1) * pageSize;

    // 构建WHERE条件
    let whereClause = `t.user_id = ${userId}`;

    if (type && type !== 'all') {
      whereClause += ` AND ct.name = '${type}'`;
    }

    if (month) {
      whereClause += ` AND t.transaction_date LIKE '${month}%'`;
    }

    // 获取记录 - 使用query方法
    const [transactions] = await pool.query(
      `SELECT t.id, t.amount, t.remark, t.transaction_date, t.created_at,
              c.name as category_name, c.icon as category_icon, c.color as category_color,
              ct.name as type_name, a.name as account_name, a.icon as account_icon
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       JOIN category_types ct ON t.type_id = ct.id
       JOIN accounts a ON t.account_id = a.id
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
    console.error('获取交易记录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 删除交易记录
// ==============================
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const { id } = req.params;

    await pool.execute(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ success: true, message: '删除成功' });

  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 生成Excel导出数据
// ==============================
app.get('/api/export', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const year = req.query.year || new Date().getFullYear();

    // 获取全年所有记录
    const [transactions] = await pool.execute(
      `SELECT t.id, t.amount, t.remark, t.transaction_date,
              c.name as category_name, c.icon as category_icon,
              ct.name as type_name, a.name as account_name
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       JOIN category_types ct ON t.type_id = ct.id
       JOIN accounts a ON t.account_id = a.id
       WHERE t.user_id = ? AND t.transaction_date LIKE ?
       ORDER BY t.transaction_date DESC, t.id DESC`,
      [userId, `${year}%`]
    );

    // 返回数据供前端生成CSV
    const data = transactions.map(t => ({
      date: t.transaction_date,
      type: t.type_name,
      category: t.category_name,
      account: t.account_name,
      amount: t.type_name === 'income' ? t.amount : '-' + t.amount,
      remark: t.remark || ''
    }));

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('导出错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 获取账户类型
// ==============================
app.get('/api/account-types', async (req, res) => {
  try {
    const [types] = await pool.execute('SELECT * FROM account_types ORDER BY id');
    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// ==============================
// 获取分类类型
// ==============================
app.get('/api/category-types', async (req, res) => {
  try {
    const [types] = await pool.execute('SELECT * FROM category_types ORDER BY id');
    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 启动服务器
app.listen(PORT, async () => {
  console.log(`✅ 财务管家API服务已启动: http://localhost:${PORT}`);
  await testConnection();
});

module.exports = app;