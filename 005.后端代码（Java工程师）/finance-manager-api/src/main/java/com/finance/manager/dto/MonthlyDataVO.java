package com.finance.manager.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MonthlyDataVO {
    private Integer month;
    private BigDecimal income;
    private BigDecimal expense;
}