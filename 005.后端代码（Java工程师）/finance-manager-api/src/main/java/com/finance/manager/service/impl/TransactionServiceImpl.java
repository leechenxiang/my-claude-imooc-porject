package com.finance.manager.service.impl;

import com.finance.manager.dto.*;
import com.finance.manager.entity.Account;
import com.finance.manager.entity.Category;
import com.finance.manager.entity.CategoryType;
import com.finance.manager.entity.Ledger;
import com.finance.manager.mapper.*;
import com.finance.manager.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class TransactionServiceImpl implements TransactionService {

    @Autowired
    private TransactionMapper transactionMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private AccountMapper accountMapper;

    @Autowired
    private LedgerMapper ledgerMapper;

    @Autowired
    private CategoryTypeMapper categoryTypeMapper;

    @Override
    public Long add(Long userId, Long categoryId, Long accountId, Double amount, String remark, String dateStr) {
        // 验证分类 - 使用selectAll来包含系统分类
        Category category = categoryMapper.selectById(categoryId);
        if (category == null) {
            // 如果查不到，尝试从所有分类中查找
            List<Category> allCategories = categoryMapper.selectAll();
            boolean found = false;
            for (Category c : allCategories) {
                if (c.getId().equals(categoryId)) {
                    category = c;
                    found = true;
                    break;
                }
            }
            if (!found) {
                throw new RuntimeException("分类不存在");
            }
        }

        // 验证账户
        Account account = accountMapper.selectById(accountId);
        if (account == null || !account.getUserId().equals(userId)) {
            throw new RuntimeException("账户不存在");
        }

        // 获取账本
        Ledger ledger = ledgerMapper.selectByUserIdAndDefault(userId);
        if (ledger == null) {
            throw new RuntimeException("账本不存在");
        }

        // 处理日期
        LocalDate transactionDate;
        if (dateStr != null && !dateStr.isEmpty()) {
            if (dateStr.contains("T")) {
                transactionDate = LocalDate.parse(dateStr.split("T")[0]);
            } else {
                transactionDate = LocalDate.parse(dateStr);
            }
        } else {
            transactionDate = LocalDate.now();
        }

        // 添加交易记录
        transactionMapper.insert(
                ledger.getId(),
                userId,
                accountId,
                categoryId,
                category.getTypeId(),
                new BigDecimal(amount.toString()),
                remark,
                transactionDate
        );

        return (long) 1;
    }

    @Override
    public HomeDataVO getHomeData(Long userId, Integer year, Integer month) {
        int currentYear = year != null ? year : LocalDate.now().getYear();
        int currentMonth = month != null ? month : LocalDate.now().getMonthValue();
        String monthPrefix = String.format("%d-%02d", currentYear, currentMonth);

        // 获取本月收入
        BigDecimal income = transactionMapper.sumByUserIdAndTypeAndMonth(userId, "income", monthPrefix + "%");
        if (income == null) income = BigDecimal.ZERO;

        // 获取本月支出
        BigDecimal expense = transactionMapper.sumByUserIdAndTypeAndMonth(userId, "expense", monthPrefix + "%");
        if (expense == null) expense = BigDecimal.ZERO;

        // 获取支出最多的3个分类
        List<CategoryStatVO> topCategories = transactionMapper.selectCategoryStatsByUserIdAndYear(userId, monthPrefix + "%");
        if (topCategories == null) topCategories = new ArrayList<>();

        // 获取最近3条记录
        List<TransactionVO> recentTransactions = transactionMapper.selectByUserIdAndMonth(userId, monthPrefix + "%", 3);

        HomeDataVO vo = new HomeDataVO();
        vo.setYear(currentYear);
        vo.setMonth(currentMonth);
        vo.setIncome(income);
        vo.setExpense(expense);
        vo.setBalance(income.subtract(expense));
        vo.setTopCategories(topCategories.subList(0, Math.min(3, topCategories.size())));
        vo.setRecentTransactions(recentTransactions);
        return vo;
    }

    @Override
    public StatisticsVO getStatistics(Long userId, Integer year) {
        int currentYear = year != null ? year : LocalDate.now().getYear();
        String yearPrefix = currentYear + "%";

        // 年度收入
        BigDecimal yearIncome = transactionMapper.sumByUserIdAndTypeAndMonth(userId, "income", yearPrefix);
        if (yearIncome == null) yearIncome = BigDecimal.ZERO;

        // 年度支出
        BigDecimal yearExpense = transactionMapper.sumByUserIdAndTypeAndMonth(userId, "expense", yearPrefix);
        if (yearExpense == null) yearExpense = BigDecimal.ZERO;

        // 支出分类统计
        List<CategoryStatVO> categoryStats = transactionMapper.selectCategoryStatsByUserIdAndYear(userId, yearPrefix);
        if (categoryStats == null) categoryStats = new ArrayList<>();

        // 月度趋势
        List<MonthlyDataVO> monthlyData = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            String monthPrefix = String.format("%d-%02d", currentYear, m);
            BigDecimal monthIncome = transactionMapper.sumByUserIdAndTypeAndMonth(userId, "income", monthPrefix + "%");
            BigDecimal monthExpense = transactionMapper.sumByUserIdAndTypeAndMonth(userId, "expense", monthPrefix + "%");

            MonthlyDataVO vo = new MonthlyDataVO();
            vo.setMonth(m);
            vo.setIncome(monthIncome != null ? monthIncome : BigDecimal.ZERO);
            vo.setExpense(monthExpense != null ? monthExpense : BigDecimal.ZERO);
            monthlyData.add(vo);
        }

        StatisticsVO vo = new StatisticsVO();
        vo.setYear(currentYear);
        vo.setYearIncome(yearIncome);
        vo.setYearExpense(yearExpense);
        vo.setYearBalance(yearIncome.subtract(yearExpense));
        vo.setCategoryStats(categoryStats);
        vo.setMonthlyData(monthlyData);
        return vo;
    }

    @Override
    public List<TransactionVO> list(Long userId, Integer page, Integer pageSize, String type, String month) {
        int offset = (page - 1) * pageSize;
        String monthPrefix = month != null ? month + "%" : null;
        return transactionMapper.selectByUserIdAndTypeAndMonth(userId, type, monthPrefix, offset, pageSize);
    }

    @Override
    public void delete(Long id, Long userId) {
        transactionMapper.deleteById(id);
    }

    @Override
    public List<ExportDataVO> getExportData(Long userId, Integer year) {
        String yearPrefix = year != null ? year.toString() + "%" : LocalDate.now().getYear() + "%";
        return transactionMapper.selectForExport(userId, yearPrefix);
    }
}