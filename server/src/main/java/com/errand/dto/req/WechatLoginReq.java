package com.errand.dto.req;

import lombok.Data;

@Data
public class WechatLoginReq {
    private String loginCode;
    private String phoneCode;
    private String nickname;
    private String avatar;
    private String phone;
}
