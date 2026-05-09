package com.finance.manager.controller;

import com.finance.manager.dto.*;
import com.finance.manager.service.UserService;
import com.finance.manager.service.AccountService;
import com.finance.manager.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AccountService accountService;

    @Autowired
    private CategoryService categoryService;

    @PostMapping("/register")
    public ApiResponse<RegisterResult> register(@RequestBody RegisterRequest request) {
        try {
            RegisterResult result = userService.register(
                    request.getUsername(),
                    request.getPassword(),
                    request.getNickname()
            );
            return ApiResponse.success("注册成功", result);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ApiResponse<LoginResult> login(@RequestBody LoginRequest request) {
        try {
            LoginResult result = userService.login(request.getUsername(), request.getPassword());
            return ApiResponse.success("登录成功", result);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    @GetMapping("/verify")
    public ApiResponse<UserInfoResult> verify(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            UserInfoResult result = userService.verifyToken(token);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.fail("未授权");
        }
    }

    @GetMapping("/user")
    public ApiResponse<UserInfoResult> getUser(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = getUserId(authHeader);
            UserInfoResult result = userService.getUserInfo(userId);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    @PutMapping("/user")
    public ApiResponse<Void> updateUser(@RequestHeader("Authorization") String authHeader,
                                     @RequestBody UserInfoResult request) {
        try {
            Long userId = getUserId(authHeader);
            userService.updateUserInfo(userId, request.getNickname(), request.getAvatarUrl(), request.getTheme());
            return ApiResponse.success("更新成功", null);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    private Long getUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        UserInfoResult result = userService.verifyToken(token);
        return result.getUserId();
    }
}