package com.finance.manager.dto;

import lombok.Data;

@Data
public class CategoryRequest {
    private String name;
    private String icon;
    private String color;
    private String type;
}