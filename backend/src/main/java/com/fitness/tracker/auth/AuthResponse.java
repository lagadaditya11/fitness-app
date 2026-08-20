package com.fitness.tracker.auth;

public record AuthResponse(String token, String email, String displayName) {
}