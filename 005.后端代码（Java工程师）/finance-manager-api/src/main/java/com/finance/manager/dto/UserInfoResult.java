package com.finance.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResult {
    private Long userId;
    private String username;
    private String nickname;
    private String avatarUrl;
    private String theme;
}