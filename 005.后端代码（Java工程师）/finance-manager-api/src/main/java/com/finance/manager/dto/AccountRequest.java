package com.finance.manager.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AccountRequest {
    private String name;
    private String icon;
    private String color;
    private Long typeId;
    private BigDecimal initialBalance;
}