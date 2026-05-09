package com.finance.manager.mapper;

import com.finance.manager.entity.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CategoryMapper {

    List<Category> selectByUserId(@Param("userId") Long userId);

    List<Category> selectByUserIdAndType(@Param("userId") Long userId, @Param("typeId") Long typeId);

    // 查询所有分类 - 包含系统分类
    List<Category> selectAll();

    Category selectById(@Param("id") Long id);

    int insert(Category category);

    int update(Category category);

    int deleteById(@Param("id") Long id);
}