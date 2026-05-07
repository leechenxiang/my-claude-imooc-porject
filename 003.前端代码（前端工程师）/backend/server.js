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
app.use(express.json());

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

// ==============================
// API路由
// ==============================

// 根路径
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

    // 验证必要字段
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    // 检查用户名是否已存在
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

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 插入用户
    const [result] = await pool.execute(
      'INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
      [username, hashedPassword, nickname || username]
    );

    const userId = result.insertId;

    // 创建默认账本
    await pool.execute(
      'INSERT INTO ledgers (user_id, name, description, is_default) VALUES (?, ?, ?, ?)',
      [userId, '默认账本', '我的第一个账本', 1]
    );

    // 创建默认账户
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

    // 生成token
    const token = jwt.sign(
      { userId, username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        userId,
        username,
        nickname: nickname || username,
        token
      }
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// ==============================
// 用户登录
// ==============================
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证必要字段
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    // 查询用户
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

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 获取用户账本
    const [ledgers] = await pool.execute(
      'SELECT id, name, description, is_default FROM ledgers WHERE user_id = ?',
      [user.id]
    );

    // 获取用户账户
    const [accounts] = await pool.execute(
      'SELECT id, name, icon, color, current_balance FROM accounts WHERE user_id = ?',
      [user.id]
    );

    // 生成token
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
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// ==============================
// 验证Token
// ==============================
app.get('/api/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未授权'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // 查询用户信息
    const [users] = await pool.execute(
      'SELECT id, username, nickname, avatar_url, theme, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
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
    res.status(401).json({
      success: false,
      message: 'Token无效'
    });
  }
});

// ==============================
// 获取用户信息
// ==============================
app.get('/api/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未授权'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const [users] = await pool.execute(
      'SELECT id, username, nickname, avatar_url, theme, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 启动服务器
app.listen(PORT, async () => {
  console.log(`✅ 财务管家API服务已启动: http://localhost:${PORT}`);
  await testConnection();
});

module.exports = app;