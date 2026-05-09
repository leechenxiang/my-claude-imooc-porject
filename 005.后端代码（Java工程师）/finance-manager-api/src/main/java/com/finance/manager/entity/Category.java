package com.finance.manager.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Category {
    private Long id;
    private Long userId;
    private Long typeId;
    private String name;
    private String icon;
    private String color;
    private Integer isSystem;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    // 扩展字段
    private String typeName;
}