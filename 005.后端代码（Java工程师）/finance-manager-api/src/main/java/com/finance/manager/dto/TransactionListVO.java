package com.finance.manager.dto;

import lombok.Data;
import java.util.List;

@Data
public class TransactionListVO {
    private List<TransactionVO> transactions;
}