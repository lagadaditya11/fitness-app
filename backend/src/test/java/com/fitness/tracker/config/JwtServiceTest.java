package com.fitness.tracker.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRET = "test-secret-that-is-definitely-long-enough-32bytes!";

    private JwtService service(String secret, MockEnvironment env) {
        return new JwtService(secret, 3_600_000, env);
    }

    @Test
    void generatesAndParsesToken() {
        JwtService jwt = service(SECRET, new MockEnvironment());
        String token = jwt.generateToken(42L, "user@example.com");

        assertThat(jwt.extractEmail(token)).isEqualTo("user@example.com");
        assertThat(jwt.extractUserId(token)).isEqualTo(42L);
        assertThat(jwt.isValid(token, "user@example.com")).isTrue();
    }

    @Test
    void rejectsTokenForDifferentEmail() {
        JwtService jwt = service(SECRET, new MockEnvironment());
        String token = jwt.generateToken(42L, "user@example.com");
        assertThat(jwt.isValid(token, "other@example.com")).isFalse();
    }

    @Test
    void rejectsExpiredToken() {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        String expired = Jwts.builder()
                .subject("user@example.com")
                .claim("userId", 1L)
                .issuedAt(new Date(System.currentTimeMillis() - 7_200_000))
                .expiration(new Date(System.currentTimeMillis() - 3_600_000))
                .signWith(key)
                .compact();

        JwtService jwt = service(SECRET, new MockEnvironment());
        assertThat(jwt.isValid(expired, "user@example.com")).isFalse();
    }

    @Test
    void rejectsShortSecret() {
        MockEnvironment env = new MockEnvironment();
        assertThatThrownBy(() -> service("too-short", env))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 32 characters");
    }

    @Test
    void rejectsBlankSecret() {
        MockEnvironment env = new MockEnvironment();
        assertThatThrownBy(() -> service("  ", env))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void refusesDefaultSecretInProdProfile() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        assertThatThrownBy(() -> service(
                "change-this-secret-to-a-long-random-value-in-production-please-32bytes", env))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("prod");
    }
}
