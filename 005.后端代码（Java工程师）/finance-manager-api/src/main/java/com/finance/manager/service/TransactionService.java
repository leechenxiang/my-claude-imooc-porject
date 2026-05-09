package com.finance.manager.service;

import com.finance.manager.dto.*;
import java.util.List;

public interface TransactionService {

    Long add(Long userId, Long categoryId, Long accountId, Double amount, String remark, String date);

    HomeDataVO getHomeData(Long userId, Integer year, Integer month);

    StatisticsVO getStatistics(Long userId, Integer year);

    List<TransactionVO> list(Long userId, Integer page, Integer pageSize, String type, String month);

    void delete(Long id, Long userId);

    List<ExportDataVO> getExportData(Long userId, Integer year);
}