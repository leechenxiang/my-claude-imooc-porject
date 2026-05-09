-- ==============================
-- 财务管家 V1.0 数据库设计
-- ==============================
-- 设计日期: 2026-05-06
-- 数据库类型: MySQL 8.0+
-- 作者: DBA
-- ==============================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS finance_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE finance_manager;

-- ==============================
-- 1. 用户表
-- ==============================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码(加密)',
    nickname VARCHAR(50) COMMENT '昵称',
    email VARCHAR(100) COMMENT '邮箱',
    avatar_url VARCHAR(500) COMMENT '头像URL',
    theme VARCHAR(20) DEFAULT 'light' COMMENT '主题: light/dark',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ==============================
-- 2. 账本表
-- ==============================
DROP TABLE IF EXISTS ledgers;
CREATE TABLE ledgers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '账本ID',
    user_id BIGINT NOT NULL COMMENT '所属用户ID',
    name VARCHAR(100) NOT NULL COMMENT '账本名称',
    description TEXT COMMENT '账本描述',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认账本',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账本表';

-- ==============================
-- 3. 账户类型表
-- ==============================
DROP TABLE IF EXISTS account_types;
CREATE TABLE account_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '账户类型ID',
    name VARCHAR(50) NOT NULL COMMENT '类型名称',
    icon VARCHAR(50) COMMENT '图标emoji',
    color VARCHAR(20) COMMENT '颜色',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账户类型表';

-- 初始化默认账户类型
INSERT INTO account_types (name, icon, color) VALUES
('现金', '💵', '#FFB7C5'),
('银行卡', '💳', '#C9B8E8'),
('微信支付', '📱', '#7DD3C0'),
('支付宝', '🟢', '#FF8FA3'),
('银行账户', '📘', '#FFA09B');

-- ==============================
-- 4. 账户表
-- ==============================
DROP TABLE IF EXISTS accounts;
CREATE TABLE accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '账户ID',
    ledger_id BIGINT NOT NULL COMMENT '所属账本ID',
    user_id BIGINT NOT NULL COMMENT '所属用户ID',
    type_id BIGINT NOT NULL COMMENT '账户类型ID',
    name VARCHAR(50) NOT NULL COMMENT '账户名称',
    icon VARCHAR(50) COMMENT '图标emoji',
    color VARCHAR(20) COMMENT '颜色',
    initial_balance DECIMAL(15,2) DEFAULT 0.00 COMMENT '初始余额',
    current_balance DECIMAL(15,2) DEFAULT 0.00 COMMENT '当前余额',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_ledger_id (ledger_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES account_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账户表';

-- ==============================
-- 5. 分类类型表
-- ==============================
DROP TABLE IF EXISTS category_types;
CREATE TABLE category_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类类型ID',
    name VARCHAR(20) NOT NULL COMMENT '类型名称',
    description VARCHAR(100) COMMENT '描述'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类类型表';

INSERT INTO category_types (name, description) VALUES
('expense', '支出'),
('income', '收入');

-- ==============================
-- 6. 分类表
-- ==============================
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
    user_id BIGINT COMMENT '所属用户ID(NULL为系统默认)',
    ledger_id BIGINT COMMENT '所属账本ID',
    type_id BIGINT NOT NULL COMMENT '分类类型ID(支出/收入)',
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    icon VARCHAR(10) COMMENT '图标emoji',
    color VARCHAR(20) COMMENT '颜色',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否系统分类',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_ledger_id (ledger_id),
    INDEX idx_type_id (type_id),
    FOREIGN KEY (type_id) REFERENCES category_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类表';

-- 初始化默认支出分类
INSERT INTO categories (user_id, type_id, name, icon, color, is_system, sort_order) VALUES
(NULL, 1, '餐饮', '🍚', '#FFA09B', 1, 1),
(NULL, 1, '交通', '🚗', '#FFA09B', 1, 2),
(NULL, 1, '购物', '🛒', '#C9B8E8', 1, 3),
(NULL, 1, '娱乐', '🎬', '#C9B8E8', 1, 4),
(NULL, 1, '住房', '🏠', '#FFB7C5', 1, 5),
(NULL, 1, '医疗', '💊', '#FFA09B', 1, 6),
(NULL, 1, '通讯', '📱', '#7DD3C0', 1, 7),
(NULL, 1, '服饰', '👔', '#C9B8E8', 1, 8),
(NULL, 1, '人情', '🎁', '#C9B8E8', 1, 9),
(NULL, 1, '其他', '📦', '#8E8E8E', 1, 10);

-- 初始化默认收入分类
INSERT INTO categories (user_id, type_id, name, icon, color, is_system, sort_order) VALUES
(NULL, 2, '工资', '💰', '#7DD3C0', 1, 1),
(NULL, 2, '兼职', '💵', '#7DD3C0', 1, 2),
(NULL, 2, '奖金', '🎯', '#7DD3C0', 1, 3),
(NULL, 2, '礼金', '🎁', '#C9B8E8', 1, 4),
(NULL, 2, '其他', '📥', '#8E8E8E', 1, 5);

-- ==============================
-- 7. 交易记录表
-- ==============================
DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '交易ID',
    ledger_id BIGINT NOT NULL COMMENT '所属账本ID',
    user_id BIGINT NOT NULL COMMENT '所属用户ID',
    account_id BIGINT NOT NULL COMMENT '账户ID',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    type_id BIGINT NOT NULL COMMENT '交易类型ID(支出/收入)',
    amount DECIMAL(15,2) NOT NULL COMMENT '金额',
    remark TEXT COMMENT '备注',
    transaction_date DATE NOT NULL COMMENT '交易日期',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_ledger_id (ledger_id),
    INDEX idx_user_id (user_id),
    INDEX idx_account_id (account_id),
    INDEX idx_category_id (category_id),
    INDEX idx_type_id (type_id),
    INDEX idx_transaction_date (transaction_date),
    FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (type_id) REFERENCES category_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='交易记录表';

-- ==============================
-- 8. 预算表
-- ==============================
DROP TABLE IF EXISTS budgets;
CREATE TABLE budgets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '预算ID',
    ledger_id BIGINT NOT NULL COMMENT '所属账本ID',
    user_id BIGINT NOT NULL COMMENT '所属用户ID',
    category_id BIGINT COMMENT '分类ID(NULL为总预算)',
    amount DECIMAL(15,2) NOT NULL COMMENT '预算金额',
    period VARCHAR(20) NOT NULL COMMENT '预算周期: monthly/weekly/yearly',
    start_date DATE NOT NULL COMMENT '开始日期',
    end_date DATE COMMENT '结束日期',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_ledger_id (ledger_id),
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预算表';

-- ==============================
-- 视图：月度收支汇总
-- ==============================
DROP VIEW IF EXISTS v_monthly_summary;
CREATE VIEW v_monthly_summary AS
SELECT
    t.ledger_id,
    t.user_id,
    DATE_FORMAT(t.transaction_date, '%Y-%m') AS month,
    ct.name AS type_name,
    SUM(t.amount) AS total_amount,
    COUNT(*) AS transaction_count
FROM transactions t
JOIN category_types ct ON t.type_id = ct.id
GROUP BY t.ledger_id, t.user_id, DATE_FORMAT(t.transaction_date, '%Y-%m'), ct.id;

-- ==============================
-- 视图：分类支出统计
-- ==============================
DROP VIEW IF EXISTS v_category_summary;
CREATE VIEW v_category_summary AS
SELECT
    t.ledger_id,
    t.user_id,
    DATE_FORMAT(t.transaction_date, '%Y-%m') AS month,
    c.id AS category_id,
    c.name AS category_name,
    c.icon AS category_icon,
    ct.name AS type_name,
    SUM(t.amount) AS total_amount,
    COUNT(*) AS transaction_count
FROM transactions t
JOIN categories c ON t.category_id = c.id
JOIN category_types ct ON t.type_id = ct.id
WHERE ct.name = 'expense'
GROUP BY t.ledger_id, t.user_id, DATE_FORMAT(t.transaction_date, '%Y-%m'), c.id;

-- ==============================
-- 存储过程：获取账户余额
-- ==============================
DROP PROCEDURE IF EXISTS sp_get_account_balance;
DELIMITER //
CREATE PROCEDURE sp_get_account_balance(IN p_account_id BIGINT)
BEGIN
    SELECT
        a.id,
        a.name,
        a.initial_balance,
        a.current_balance,
        COALESCE(
            (SELECT SUM(t.amount)
            FROM transactions t
            WHERE t.account_id = p_account_id AND t.type_id = 1),
            0
        ) AS total_expense,
        COALESCE(
            (SELECT SUM(t.amount)
            FROM transactions t
            WHERE t.account_id = p_account_id AND t.type_id = 2),
            0
        ) AS total_income
    FROM accounts a
    WHERE a.id = p_account_id;
END //
DELIMITER ;

-- ==============================
-- 存储过程：更新账户余额
-- ==============================
DROP PROCEDURE IF EXISTS sp_update_account_balance;
DELIMITER //
CREATE PROCEDURE sp_update_account_balance(IN p_account_id BIGINT)
BEGIN
    DECLARE total_in DECIMAL(15,2);
    DECLARE total_out DECIMAL(15,2);

    SELECT COALESCE(SUM(amount), 0) INTO total_in
    FROM transactions
    WHERE account_id = p_account_id AND type_id = 2;

    SELECT COALESCE(SUM(amount), 0) INTO total_out
    FROM transactions
    WHERE account_id = p_account_id AND type_id = 1;

    UPDATE accounts
    SET current_balance = initial_balance + total_in - total_out
    WHERE id = p_account_id;
END //
DELIMITER ;

-- ==============================
-- 触发器：交易后自动更新账户余额
-- ==============================
DROP TRIGGER IF EXISTS tr_after_transaction;
DELIMITER //
CREATE TRIGGER tr_after_transaction
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    CALL sp_update_account_balance(NEW.account_id);
END //
DELIMITER ;

-- ==============================
-- 测试数据
-- ==============================

-- 插入测试用户
INSERT INTO users (username, password, nickname) VALUES
('test', 'password123', '测试用户');

-- 获取测试用户ID并插入账本
SET @test_user_id = (SELECT id FROM users WHERE username = 'test' LIMIT 1);
INSERT INTO ledgers (user_id, name, description, is_default) VALUES
(@test_user_id, '默认账本', '我的第一个账本', 1);

-- 获取账本ID
SET @test_ledger_id = (SELECT id FROM ledgers WHERE user_id = @test_user_id LIMIT 1);

-- 插入测试账户
INSERT INTO accounts (ledger_id, user_id, type_id, name, icon, color, initial_balance, current_balance) VALUES
(@test_ledger_id, @test_user_id, 1, '现金', '💵', '#FFB7C5', 1000.00, 1000.00),
(@test_ledger_id, @test_user_id, 3, '微信', '📱', '#7DD3C0', 500.00, 500.00),
(@test_ledger_id, @test_user_id, 4, '支付宝', '🟢', '#FF8FA3', 2000.00, 2000.00);

-- 插入测试交易记录
INSERT INTO transactions (ledger_id, user_id, account_id, category_id, type_id, amount, remark, transaction_date) VALUES
(@test_ledger_id, @test_user_id, 1, 1, 1, 58.00, '午餐', '2026-04-29'),
(@test_ledger_id, @test_user_id, 1, 2, 1, 26.00, '打车', '2026-04-28'),
(@test_ledger_id, @test_user_id, 3, 12, 2, 12000.00, '工资', '2026-04-25'),
(@test_ledger_id, @test_user_id, 2, 3, 1, 199.00, '购物', '2026-03-27'),
(@test_ledger_id, @test_user_id, 3, 14, 2, 500.00, '礼金', '2026-03-20');

-- ==============================
-- 数据库设计完成
-- ==============================