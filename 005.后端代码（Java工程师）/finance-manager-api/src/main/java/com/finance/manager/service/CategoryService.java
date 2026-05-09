package com.finance.manager.service;

import com.finance.manager.entity.Category;
import java.util.List;

public interface CategoryService {

    List<Category> list(Long userId, String type);

    Category getById(Long id);

    Long add(Long userId, String name, String icon, String color, String type);

    void update(Long id, Long userId, String name, String icon, String color);

    void delete(Long id, Long userId);
}