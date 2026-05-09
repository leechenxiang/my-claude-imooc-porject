package com.finance.manager.controller;

import com.finance.manager.dto.*;
import com.finance.manager.entity.Account;
import com.finance.manager.entity.AccountType;
import com.finance.manager.mapper.AccountTypeMapper;
import com.finance.manager.service.AccountService;
import com.finance.manager.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private UserService userService;

    @Autowired
    private AccountTypeMapper accountTypeMapper;

    @GetMapping("/accounts")
    public ApiResponse<List<Account>> list(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = getUserId(authHeader);
            List<Account> accounts = accountService.list(userId);
            return ApiResponse.success(accounts);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    @PostMapping("/accounts")
    public ApiResponse<Long> add(@RequestHeader("Authorization") String authHeader,
                              @RequestBody AccountRequest request) {
        try {
            Long userId = getUserId(authHeader);
            Double initialBalance = request.getInitialBalance() != null ?
                    request.getInitialBalance().doubleValue() : null;
            Long id = accountService.add(userId, request.getName(), request.getIcon(),
                    request.getColor(), request.getTypeId(), initialBalance);
            return ApiResponse.success("添加成功", id);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    @PutMapping("/accounts/{id}")
    public ApiResponse<Void> update(@RequestHeader("Authorization") String authHeader,
                                  @PathVariable Long id,
                                  @RequestBody AccountRequest request) {
        try {
            Long userId = getUserId(authHeader);
            accountService.update(id, userId, request.getName(), request.getIcon(),
                    request.getColor(), request.getTypeId());
            return ApiResponse.success("更新成功", null);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    @DeleteMapping("/accounts/{id}")
    public ApiResponse<Void> delete(@RequestHeader("Authorization") String authHeader,
                                  @PathVariable Long id) {
        try {
            Long userId = getUserId(authHeader);
            accountService.delete(id, userId);
            return ApiResponse.success("删除成功", null);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    @GetMapping("/account-types")
    public ApiResponse<List<AccountType>> listTypes() {
        try {
            List<AccountType> types = accountTypeMapper.selectAll();
            return ApiResponse.success(types);
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