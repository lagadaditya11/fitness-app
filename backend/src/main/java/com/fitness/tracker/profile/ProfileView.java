package com.fitness.tracker.profile;

import com.fitness.tracker.user.User;

public record ProfileView(
        Long id,
        String email,
        String displayName,
        Double heightCm,
        Double weightKg,
        Integer age,
        String sex,
        String activityLevel,
        Integer customDailyCalories
) {
    public static ProfileView of(User u) {
        return new ProfileView(u.getId(), u.getEmail(), u.getDisplayName(),
                u.getHeightCm(), u.getWeightKg(), u.getAge(),
                u.getSex() == null ? null : u.getSex().name(),
                u.getActivityLevel() == null ? null : u.getActivityLevel().name(),
                u.getCustomDailyCalories());
    }
}