package com.fitness.tracker.profile;

import com.fitness.tracker.user.User;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @Size(max = 100, message = "Display name must be at most 100 characters")
        String displayName,

        @Positive(message = "Height must be positive")
        @Max(value = 300, message = "Height must be at most 300 cm")
        Double heightCm,

        @Positive(message = "Weight must be positive")
        @Max(value = 500, message = "Weight must be at most 500 kg")
        Double weightKg,

        @Min(value = 1, message = "Age must be at least 1")
        @Max(value = 130, message = "Age must be at most 130")
        Integer age,

        User.Sex sex,
        User.ActivityLevel activityLevel,

        @Positive(message = "Daily calories must be positive")
        @Max(value = 20000, message = "Daily calories must be at most 20000")
        Integer customDailyCalories
) {
}
