package com.finance.manager.mapper;

import com.finance.manager.entity.CategoryType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CategoryTypeMapper {

    List<CategoryType> selectAll();

    CategoryType selectByName(@Param("name") String name);
}