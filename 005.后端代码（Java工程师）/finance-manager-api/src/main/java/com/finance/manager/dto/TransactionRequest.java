package com.finance.manager.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {
    @JsonProperty("categoryId")
    private Long categoryId;

    @JsonProperty("category_id")
    private Long categoryIdFromSnake;

    @JsonProperty("accountId")
    private Long accountId;

    @JsonProperty("account_id")
    private Long accountIdFromSnake;

    private BigDecimal amount;
    private String remark;
    private LocalDate date;

    // 支持两种命名方式
    public Long getCategoryId() {
        return categoryId != null ? categoryId : categoryIdFromSnake;
    }

    public Long getAccountId() {
        return accountId != null ? accountId : accountIdFromSnake;
    }
}