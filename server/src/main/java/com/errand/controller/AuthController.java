package com.errand.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.errand.common.BizException;
import com.errand.common.Result;
import com.errand.config.JwtUtil;
import com.errand.config.WechatConfig;
import com.errand.dto.req.WechatLoginReq;
import com.errand.dto.resp.LoginResp;
import com.errand.entity.User;
import com.errand.mapper.UserMapper;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private WechatConfig wechatConfig;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserMapper userMapper;

    private final OkHttpClient http = new OkHttpClient();

    @PostMapping("/wechat-login")
    public Result<LoginResp> wechatLogin(@RequestBody WechatLoginReq req) {
        if (req.getLoginCode() == null) throw new BizException("缺少 loginCode");

        String openid;
        boolean mock = isMockConfig();

        if (mock) {
            openid = "mock_" + req.getLoginCode().hashCode();
        } else {
            String url = "https://api.weixin.qq.com/sns/jscode2session"
                + "?appid=" + wechatConfig.getAppid()
                + "&secret=" + wechatConfig.getSecret()
                + "&js_code=" + req.getLoginCode()
                + "&grant_type=authorization_code";
            String resp = httpGet(url);
            JSONObject json = JSON.parseObject(resp);
            openid = json.getString("openid");
            if (openid == null) throw new BizException("微信登录失败: " + resp);
        }

        User user = userMapper.selectOne(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<User>()
                .eq(User::getOpenid, openid)
        );
        boolean isNew = false;

        if (user == null) {
            user = new User();
            user.setOpenid(openid);
            user.setRole("user");
            user.setNickname(req.getNickname() != null ? req.getNickname() : "微信用户");
            user.setAvatar(req.getAvatar());
            user.setPhone(req.getPhone());
            user.setRating(new BigDecimal("5.00"));
            userMapper.insert(user);
            isNew = true;
        } else {
            if (req.getNickname() != null) user.setNickname(req.getNickname());
            if (req.getPhone() != null) user.setPhone(req.getPhone());
            if (req.getAvatar() != null) user.setAvatar(req.getAvatar());
            userMapper.updateById(user);
        }

        String token = jwtUtil.generate(user.getId(), user.getOpenid(), user.getRole());

        LoginResp r = new LoginResp();
        r.setToken(token);
        r.setUserInfo(user);
        r.setNewUser(isNew);
        return Result.ok(r);
    }

    private boolean isMockConfig() {
        String appid = wechatConfig.getAppid();
        String secret = wechatConfig.getSecret();
        return appid == null || appid.contains("your_appid")
            || secret == null || secret.contains("your_app_secret");
    }

    @GetMapping("/dev-login")
    public Result<LoginResp> devLogin(@RequestParam String openid) {
        User user = userMapper.selectOne(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<User>()
                .eq(User::getOpenid, openid)
        );
        if (user == null) {
            user = new User();
            user.setOpenid(openid);
            user.setRole(detectDevRole(openid));
            user.setNickname("开发用户-" + openid);
            user.setRating(new BigDecimal("5.00"));
            userMapper.insert(user);
        } else if ("user".equals(user.getRole())) {
            String inferred = detectDevRole(openid);
            if (!"user".equals(inferred)) {
                user.setRole(inferred);
                userMapper.updateById(user);
            }
        }
        String token = jwtUtil.generate(user.getId(), user.getOpenid(), user.getRole());
        LoginResp r = new LoginResp();
        r.setToken(token);
        r.setUserInfo(user);
        r.setNewUser(false);
        return Result.ok(r);
    }


    private String detectDevRole(String openid) {
        if (openid.startsWith("runner")) return "runner";
        if (openid.startsWith("admin")) return "admin";
        return "user";
    }

    private String httpGet(String url) {
        Request req = new Request.Builder().url(url).get().build();
        try (Response resp = http.newCall(req).execute()) {
            return resp.body().string();
        } catch (IOException e) {
            throw new BizException("调微信接口失败: " + e.getMessage());
        }
    }
}
