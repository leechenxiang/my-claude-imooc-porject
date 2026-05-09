package com.finance.manager.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExportDataVO {
    private LocalDate date;
    private String type;
    private String category;
    private String account;
    private BigDecimal amount;
    private String remark;
}