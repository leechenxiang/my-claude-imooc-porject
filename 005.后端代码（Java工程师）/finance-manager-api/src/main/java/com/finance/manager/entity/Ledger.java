package com.finance.manager.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Ledger {
    private Long id;
    private Long userId;
    private String name;
    private String description;
    private Integer isDefault;
    private LocalDateTime createdAt;
}