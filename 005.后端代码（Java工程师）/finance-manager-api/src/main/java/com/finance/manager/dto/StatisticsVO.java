package com.finance.manager.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class StatisticsVO {
    private Integer year;
    private BigDecimal yearIncome;
    private BigDecimal yearExpense;
    private BigDecimal yearBalance;
    private List<CategoryStatVO> categoryStats;
    private List<MonthlyDataVO> monthlyData;
}