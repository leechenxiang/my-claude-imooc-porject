package com.finance.manager.service.impl;

import com.finance.manager.entity.Category;
import com.finance.manager.entity.CategoryType;
import com.finance.manager.mapper.CategoryMapper;
import com.finance.manager.mapper.CategoryTypeMapper;
import com.finance.manager.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private CategoryTypeMapper categoryTypeMapper;

    @Override
    public List<Category> list(Long userId, String type) {
        if (type != null && !type.isEmpty()) {
            CategoryType categoryType = categoryTypeMapper.selectByName(type);
            if (categoryType != null) {
                return categoryMapper.selectByUserIdAndType(userId, categoryType.getId());
            }
        }
        return categoryMapper.selectByUserId(userId);
    }

    @Override
    public Category getById(Long id) {
        return categoryMapper.selectById(id);
    }

    @Override
    public Long add(Long userId, String name, String icon, String color, String type) {
        CategoryType categoryType = categoryTypeMapper.selectByName(type);
        if (categoryType == null) {
            throw new RuntimeException("无效的分类类型");
        }

        Category category = new Category();
        category.setUserId(userId);
        category.setTypeId(categoryType.getId());
        category.setName(name);
        category.setIcon(icon);
        category.setColor(color != null ? color : "#FFB7C5");
        category.setIsSystem(0);

        categoryMapper.insert(category);
        return category.getId();
    }

    @Override
    public void update(Long id, Long userId, String name, String icon, String color) {
        Category category = new Category();
        category.setId(id);
        category.setName(name);
        category.setIcon(icon);
        category.setColor(color);
        categoryMapper.update(category);
    }

    @Override
    public void delete(Long id, Long userId) {
        categoryMapper.deleteById(id);
    }
}