package com.finance.manager.mapper;

import com.finance.manager.dto.CategoryStatVO;
import com.finance.manager.dto.ExportDataVO;
import com.finance.manager.dto.TransactionVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Mapper
public interface TransactionMapper {

    int insert(@Param("ledgerId") Long ledgerId,
              @Param("userId") Long userId,
              @Param("accountId") Long accountId,
              @Param("categoryId") Long categoryId,
              @Param("typeId") Long typeId,
              @Param("amount") BigDecimal amount,
              @Param("remark") String remark,
              @Param("transactionDate") LocalDate transactionDate);

    List<TransactionVO> selectByUserIdAndMonth(@Param("userId") Long userId,
                                             @Param("monthPrefix") String monthPrefix,
                                             @Param("limit") Integer limit);

    List<TransactionVO> selectByUserIdAndTypeAndMonth(@Param("userId") Long userId,
                                                   @Param("type") String type,
                                                   @Param("monthPrefix") String monthPrefix,
                                                   @Param("offset") Integer offset,
                                                   @Param("pageSize") Integer pageSize);

    int countByUserIdAndTypeAndMonth(@Param("userId") Long userId,
                                  @Param("type") String type,
                                  @Param("monthPrefix") String monthPrefix);

    BigDecimal sumByUserIdAndTypeAndMonth(@Param("userId") Long userId,
                                       @Param("type") String type,
                                       @Param("monthPrefix") String monthPrefix);

    List<CategoryStatVO> selectCategoryStatsByUserIdAndYear(@Param("userId") Long userId,
                                                   @Param("yearPrefix") String yearPrefix);

    List<ExportDataVO> selectForExport(@Param("userId") Long userId,
                                       @Param("yearPrefix") String yearPrefix);

    int deleteById(@Param("id") Long id);
}