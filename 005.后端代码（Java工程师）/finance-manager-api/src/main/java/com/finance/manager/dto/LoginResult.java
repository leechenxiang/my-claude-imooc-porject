package com.finance.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResult {
    private Long userId;
    private String username;
    private String nickname;
    private String avatarUrl;
    private String theme;
    private String token;
    private List<?> ledgers;
    private List<?> accounts;
}