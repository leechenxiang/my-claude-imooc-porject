package com.finance.manager.mapper;

import com.finance.manager.entity.Account;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AccountMapper {

    List<Account> selectByUserId(@Param("userId") Long userId);

    Account selectById(@Param("id") Long id);

    int insert(Account account);

    int update(Account account);

    int deleteById(@Param("id") Long id);
}