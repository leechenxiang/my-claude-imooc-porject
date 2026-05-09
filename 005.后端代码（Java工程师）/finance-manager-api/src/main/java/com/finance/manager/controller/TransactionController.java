package com.finance.manager.controller;

import com.finance.manager.dto.*;
import com.finance.manager.service.TransactionService;
import com.finance.manager.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserService userService;

    @PostMapping("/transactions")
    public ApiResponse<Long> add(@RequestHeader("Authorization") String authHeader,
                               @RequestBody TransactionRequest request) {
        try {
            Long userId = getUserId(authHeader);
            String dateStr = request.getDate() != null ? request.getDate().toString() : null;
            Long id = transactionService.add(userId, request.getCategoryId(),
                    request.getAccountId(), request.getAmount().doubleValue(),
                    request.getRemark(), dateStr);
            return ApiResponse.success("添加成功", id);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    @GetMapping("/transactions")
    public ApiResponse<TransactionListVO> list(@RequestHeader("Authorization") String authHeader,
                                              @RequestParam(defaultValue = "1") Integer page,
                                              @RequestParam(defaultValue = "20") Integer pageSize,
                                              @RequestParam(required = false) String type,
                                              @RequestParam(required = false) String month) {
        try {
            Long userId = getUserId(authHeader);
            List<TransactionVO> transactions = transactionService.list(userId, page, pageSize, type, month);
            TransactionListVO result = new TransactionListVO();
            result.setTransactions(transactions);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    @GetMapping("/home")
    public ApiResponse<HomeDataVO> home(@RequestHeader("Authorization") String authHeader,
                                       @RequestParam(required = false) Integer year,
                                       @RequestParam(required = false) Integer month) {
        try {
            Long userId = getUserId(authHeader);
            HomeDataVO data = transactionService.getHomeData(userId, year, month);
            return ApiResponse.success(data);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    @GetMapping("/statistics")
    public ApiResponse<StatisticsVO> statistics(@RequestHeader("Authorization") String authHeader,
                                                 @RequestParam(required = false) Integer year) {
        try {
            Long userId = getUserId(authHeader);
            StatisticsVO data = transactionService.getStatistics(userId, year);
            return ApiResponse.success(data);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    @GetMapping("/export")
    public ApiResponse<List<ExportDataVO>> export(@RequestHeader("Authorization") String authHeader,
                                          @RequestParam(required = false) Integer year) {
        try {
            Long userId = getUserId(authHeader);
            List<ExportDataVO> data = transactionService.getExportData(userId, year);
            return ApiResponse.success(data);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    @DeleteMapping("/transactions/{id}")
    public ApiResponse<Void> delete(@RequestHeader("Authorization") String authHeader,
                                    @PathVariable Long id) {
        try {
            Long userId = getUserId(authHeader);
            transactionService.delete(id, userId);
            return ApiResponse.success("删除成功", null);
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