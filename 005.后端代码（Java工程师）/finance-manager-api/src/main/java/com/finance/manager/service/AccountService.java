package com.finance.manager.service;

import com.finance.manager.entity.Account;
import java.util.List;

public interface AccountService {

    List<Account> list(Long userId);

    Account getById(Long id);

    Long add(Long userId, String name, String icon, String color, Long typeId, Double initialBalance);

    void update(Long id, Long userId, String name, String icon, String color, Long typeId);

    void delete(Long id, Long userId);
}