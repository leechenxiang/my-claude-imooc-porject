/**
 * 初始化管理员账户
 * 运行: node init_admin.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'finance_manager'
  });

  try {
    // 检查admins表是否存在
    const [tables] = await connection.execute('SHOW TABLES LIKE "admins"');
    if (tables.length === 0) {
      // 创建admins表
      await connection.execute(`
        CREATE TABLE admins (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          nickname VARCHAR(50),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ admins表创建成功');
    }

    // 检查是否已有管理员
    const [admins] = await connection.execute('SELECT id FROM admins WHERE username = "admin"');
    if (admins.length === 0) {
      // 创建默认管理员
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.execute(
        'INSERT INTO admins (username, password, nickname) VALUES (?, ?, ?)',
        ['admin', hashedPassword, '超级管理员']
      );
      console.log('✅ 默认管理员创建成功');
      console.log('   用户名: admin');
      console.log('   密码: admin123');
    } else {
      console.log('ℹ️ 管理员已存在');
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await connection.end();
  }
}

initAdmin();