package com.finance.manager.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionVO {
    private Long id;
    private BigDecimal amount;
    private String remark;
    private LocalDate transactionDate;
    private java.time.LocalDateTime createdAt;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private String typeName;
    private String accountName;
    private String accountIcon;
}