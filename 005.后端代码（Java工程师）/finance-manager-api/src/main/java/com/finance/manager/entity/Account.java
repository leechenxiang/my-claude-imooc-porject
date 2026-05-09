package com.finance.manager.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Account {
    private Long id;
    private Long ledgerId;
    private Long userId;
    private Long typeId;
    private String name;
    private String icon;
    private String color;
    private BigDecimal initialBalance;
    private BigDecimal currentBalance;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    // 扩展字段
    private String typeName;
    private String typeIcon;
}