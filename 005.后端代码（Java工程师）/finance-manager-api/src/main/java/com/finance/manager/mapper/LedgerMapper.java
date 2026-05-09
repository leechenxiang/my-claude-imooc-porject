package com.finance.manager.mapper;

import com.finance.manager.entity.Ledger;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface LedgerMapper {

    Ledger selectByUserIdAndDefault(@Param("userId") Long userId);

    int insert(Ledger ledger);

    List<Ledger> selectByUserId(@Param("userId") Long userId);
}