package com.finance.manager.service;

import com.finance.manager.dto.*;
import com.finance.manager.entity.Account;

import java.util.List;

public interface UserService {

    /**
     * 用户注册
     */
    RegisterResult register(String username, String password, String nickname);

    /**
     * 用户登录
     */
    LoginResult login(String username, String password);

    /**
     * 验证Token
     */
    UserInfoResult verifyToken(String token);

    /**
     * 获取用户信息
     */
    UserInfoResult getUserInfo(Long userId);

    /**
     * 更新用户信息
     */
    void updateUserInfo(Long userId, String nickname, String avatarUrl, String theme);

    /**
     * 获取用户账户列表
     */
    List<Account> getAccounts(Long userId);

    /**
     * 获取用户账本列表
     */
    List<?> getLedgers(Long userId);
}