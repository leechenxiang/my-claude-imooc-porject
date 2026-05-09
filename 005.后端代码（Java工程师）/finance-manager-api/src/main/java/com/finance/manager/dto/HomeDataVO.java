package com.finance.manager.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class HomeDataVO {
    private Integer year;
    private Integer month;
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal balance;
    private java.util.List<CategoryStatVO> topCategories;
    private java.util.List<TransactionVO> recentTransactions;
}