package com.finance.manager.service.impl;

import com.finance.manager.dto.*;
import com.finance.manager.entity.*;
import com.finance.manager.mapper.*;
import com.finance.manager.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private LedgerMapper ledgerMapper;

    @Autowired
    private AccountMapper accountMapper;

    @Autowired
    private AccountTypeMapper accountTypeMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    private static final String JWT_SECRET = "finance-manager-secret-key-2026";

    @Override
    public RegisterResult register(String username, String password, String nickname) {
        // 检查用户名是否存在
        User existUser = userMapper.selectByUsername(username);
        if (existUser != null) {
            throw new RuntimeException("用户名已存在");
        }

        // 简单加密密码
        String hashedPassword = simpleEncrypt(password);

        // 创建用户
        User user = new User();
        user.setUsername(username);
        user.setPassword(hashedPassword);
        user.setNickname(nickname != null ? nickname : username);
        userMapper.insert(user);

        Long userId = user.getId();

        // 创建默认账本
        Ledger ledger = new Ledger();
        ledger.setUserId(userId);
        ledger.setName("默认账本");
        ledger.setDescription("我的第一个账本");
        ledger.setIsDefault(1);
        ledgerMapper.insert(ledger);

        Long ledgerId = ledger.getId();

        // 创建默认账户
        createDefaultAccounts(ledgerId, userId);

        // 创建默认分类
        createDefaultCategories(userId);

        // 生成简单Token
        String token = simpleToken(userId, username);

        return new RegisterResult(userId, username, user.getNickname(), token);
    }

    private void createDefaultAccounts(Long ledgerId, Long userId) {
        String[][] defaultAccounts = {
            {"现金", "💵", "#FFB7C5"},
            {"微信支付", "📱", "#7DD3C0"},
            {"支付宝", "🟢", "#FF8FA3"}
        };

        for (String[] acc : defaultAccounts) {
            AccountType type = accountTypeMapper.selectByName(acc[0]);
            if (type != null) {
                Account account = new Account();
                account.setLedgerId(ledgerId);
                account.setUserId(userId);
                account.setTypeId(type.getId());
                account.setName(acc[0]);
                account.setIcon(acc[1]);
                account.setColor(acc[2]);
                account.setInitialBalance(new java.math.BigDecimal("0"));
                account.setCurrentBalance(new java.math.BigDecimal("0"));
                accountMapper.insert(account);
            }
        }
    }

    // 创建默认分类
    private void createDefaultCategories(Long userId) {
        // 支出分类（type_id = 1）
        String[][] expenseCategories = {
            {"餐饮", "🍚", "#FFA09B"},
            {"交通", "🚗", "#FFA09B"},
            {"购物", "🛒", "#C9B8E8"},
            {"娱乐", "🎬", "#C9B8E8"},
            {"住房", "🏠", "#FFB7C5"},
            {"医疗", "💊", "#FFA09B"},
            {"通讯", "📱", "#7DD3C0"},
            {"服饰", "👔", "#C9B8E8"},
            {"人情", "🎁", "#C9B8E8"},
            {"其他", "📦", "#8E8E8E"}
        };

        for (String[] cat : expenseCategories) {
            Category category = new Category();
            category.setUserId(userId);
            category.setTypeId(1L);  // expense
            category.setName(cat[0]);
            category.setIcon(cat[1]);
            category.setColor(cat[2]);
            category.setIsSystem(0);
            categoryMapper.insert(category);
        }

        // 收入分类（type_id = 2）
        String[][] incomeCategories = {
            {"工资", "💰", "#7DD3C0"},
            {"兼职", "💵", "#7DD3C0"},
            {"奖金", "🎯", "#7DD3C0"},
            {"礼金", "🎁", "#C9B8E8"},
            {"其他", "📥", "#8E8E8E"}
        };

        for (String[] cat : incomeCategories) {
            Category category = new Category();
            category.setUserId(userId);
            category.setTypeId(2L);  // income
            category.setName(cat[0]);
            category.setIcon(cat[1]);
            category.setColor(cat[2]);
            category.setIsSystem(0);
            categoryMapper.insert(category);
        }
    }

    @Override
    public LoginResult login(String username, String password) {
        User user = userMapper.selectByUsername(username);
        if (user == null) {
            throw new RuntimeException("用户名或密码错误");
        }

        // 验证密码
        if (!simpleVerify(password, user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        // 获取账本和账户
        List<Ledger> ledgers = ledgerMapper.selectByUserId(user.getId());
        List<Account> accounts = accountMapper.selectByUserId(user.getId());

        // 生成简单Token
        String token = simpleToken(user.getId(), username);

        LoginResult result = new LoginResult();
        result.setUserId(user.getId());
        result.setUsername(user.getUsername());
        result.setNickname(user.getNickname());
        result.setAvatarUrl(user.getAvatarUrl());
        result.setTheme(user.getTheme());
        result.setToken(token);
        result.setLedgers(ledgers);
        result.setAccounts(accounts);
        return result;
    }

    @Override
    public UserInfoResult verifyToken(String token) {
        try {
            Map<String, Object> claims = parseSimpleToken(token);
            Long userId = Long.parseLong(claims.get("userId").toString());
            User user = userMapper.selectById(userId);
            if (user == null) {
                throw new RuntimeException("用户不存在");
            }
            UserInfoResult result = new UserInfoResult();
            result.setUserId(user.getId());
            result.setUsername(user.getUsername());
            result.setNickname(user.getNickname());
            result.setAvatarUrl(user.getAvatarUrl());
            result.setTheme(user.getTheme());
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Token无效");
        }
    }

    @Override
    public UserInfoResult getUserInfo(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        UserInfoResult result = new UserInfoResult();
        result.setUserId(user.getId());
        result.setUsername(user.getUsername());
        result.setNickname(user.getNickname());
        result.setAvatarUrl(user.getAvatarUrl());
        result.setTheme(user.getTheme());
        return result;
    }

    @Override
    public void updateUserInfo(Long userId, String nickname, String avatarUrl, String theme) {
        User user = new User();
        user.setId(userId);
        user.setNickname(nickname);
        user.setAvatarUrl(avatarUrl);
        user.setTheme(theme);
        userMapper.update(user);
    }

    @Override
    public List<Account> getAccounts(Long userId) {
        return accountMapper.selectByUserId(userId);
    }

    @Override
    public List<?> getLedgers(Long userId) {
        return ledgerMapper.selectByUserId(userId);
    }

    // 简单Token生成
    private String simpleToken(Long userId, String username) {
        Map<String, Object> data = new HashMap<>();
        data.put("userId", userId);
        data.put("username", username);
        String json = data.toString();
        return Base64.getEncoder().encodeToString(json.getBytes());
    }

    // 简单Token解析
    private Map<String, Object> parseSimpleToken(String token) {
        try {
            String json = new String(Base64.getDecoder().decode(token));
            json = json.replace("{", "").replace("}", "");
            Map<String, Object> result = new HashMap<>();
            String[] pairs = json.split(",");
            for (String pair : pairs) {
                String[] kv = pair.split("=");
                if (kv.length == 2) {
                    result.put(kv[0].trim(), kv[1].trim());
                }
            }
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Token解析失败");
        }
    }

    // 简单加密
    private String simpleEncrypt(String password) {
        return Base64.getEncoder().encodeToString(password.getBytes());
    }

    // 简单验证
    private boolean simpleVerify(String password, String encrypted) {
        try {
            String decrypted = new String(Base64.getDecoder().decode(encrypted));
            return password.equals(decrypted);
        } catch (Exception e) {
            return password.equals(encrypted);
        }
    }
}