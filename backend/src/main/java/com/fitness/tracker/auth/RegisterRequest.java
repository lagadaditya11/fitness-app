package com.fitness.tracker.auth;

public record RegisterRequest(
        String email,
        String password,
        String displayName,
        Double heightCm,
        Double weightKg,
        Integer age,
        String sex,
        String activityLevel
) {
}