package com.finance.manager.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CategoryStatVO {
    private Long id;
    private String name;
    private String icon;
    private String color;
    private BigDecimal total;
}