package com.errand.dto.resp;

import com.errand.entity.User;
import lombok.Data;

@Data
public class LoginResp {
    private String token;
    private User userInfo;
    private boolean newUser;
}
