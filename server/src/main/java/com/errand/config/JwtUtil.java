package com.errand.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.expire-hours}")
    private long expireHours;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generate(Long userId, String openid, String role) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
            .subject(String.valueOf(userId))
            .claim("openid", openid)
            .claim("role", role)
            .issuedAt(new Date(now))
            .expiration(new Date(now + expireHours * 3600000))
            .signWith(getKey())
            .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(getKey()).build().parseSignedClaims(token).getPayload();
    }

    public Long getUserId(String token) { return Long.parseLong(parse(token).getSubject()); }
    public String getOpenid(String token) { return parse(token).get("openid", String.class); }
    public String getRole(String token) { return parse(token).get("role", String.class); }
}
