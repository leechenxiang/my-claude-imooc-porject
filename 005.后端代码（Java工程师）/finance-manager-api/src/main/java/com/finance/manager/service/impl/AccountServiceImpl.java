package com.finance.manager.service.impl;

import com.finance.manager.entity.Account;
import com.finance.manager.entity.AccountType;
import com.finance.manager.entity.Ledger;
import com.finance.manager.mapper.AccountMapper;
import com.finance.manager.mapper.AccountTypeMapper;
import com.finance.manager.mapper.LedgerMapper;
import com.finance.manager.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AccountServiceImpl implements AccountService {

    @Autowired
    private AccountMapper accountMapper;

    @Autowired
    private LedgerMapper ledgerMapper;

    @Autowired
    private AccountTypeMapper accountTypeMapper;

    @Override
    public List<Account> list(Long userId) {
        return accountMapper.selectByUserId(userId);
    }

    @Override
    public Account getById(Long id) {
        return accountMapper.selectById(id);
    }

    @Override
    public Long add(Long userId, String name, String icon, String color, Long typeId, Double initialBalance) {
        // 获取默认账本
        Ledger ledger = ledgerMapper.selectByUserIdAndDefault(userId);
        if (ledger == null) {
            throw new RuntimeException("账本不存在");
        }

        Account account = new Account();
        account.setLedgerId(ledger.getId());
        account.setUserId(userId);
        account.setTypeId(typeId != null ? typeId : 1L);
        account.setName(name);
        account.setIcon(icon);
        account.setColor(color != null ? color : "#FFB7C5");
        account.setInitialBalance(initialBalance != null ? new BigDecimal(initialBalance.toString()) : BigDecimal.ZERO);
        account.setCurrentBalance(initialBalance != null ? new BigDecimal(initialBalance.toString()) : BigDecimal.ZERO);

        accountMapper.insert(account);
        return account.getId();
    }

    @Override
    public void update(Long id, Long userId, String name, String icon, String color, Long typeId) {
        Account account = new Account();
        account.setId(id);
        account.setName(name);
        account.setIcon(icon);
        account.setColor(color);
        account.setTypeId(typeId);
        accountMapper.update(account);
    }

    @Override
    public void delete(Long id, Long userId) {
        accountMapper.deleteById(id);
    }
}