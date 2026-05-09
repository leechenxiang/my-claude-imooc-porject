package com.finance.manager.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Transaction {
    private Long id;
    private Long ledgerId;
    private Long userId;
    private Long accountId;
    private Long categoryId;
    private Long typeId;
    private BigDecimal amount;
    private String remark;
    private LocalDate transactionDate;
    private LocalDateTime createdAt;
    // 扩展字段
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private String typeName;
    private String accountName;
    private String accountIcon;
}