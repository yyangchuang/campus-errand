package com.errand.config;

import com.errand.common.BizException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {
    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse resp, Object handler) {
        String token = req.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            try {
                req.setAttribute("userId", jwtUtil.getUserId(token));
                req.setAttribute("openid", jwtUtil.getOpenid(token));
                req.setAttribute("role", jwtUtil.getRole(token));
                return true;
            } catch (Exception e) {
                throw new BizException(401, "登录已过期，请重新登录");
            }
        }
        throw new BizException(401, "未登录");
    }
}
