package com.finance.manager.mapper;

import com.finance.manager.entity.AccountType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AccountTypeMapper {

    List<AccountType> selectAll();

    AccountType selectByName(@Param("name") String name);
}