package com.fitness.tracker.profile;

import com.fitness.tracker.config.CurrentUser;
import com.fitness.tracker.user.User;
import com.fitness.tracker.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    public ProfileService(UserRepository userRepository, CurrentUser currentUser) {
        this.userRepository = userRepository;
        this.currentUser = currentUser;
    }

    public User update(ProfileUpdateRequest updates) {
        User user = currentUser.get();
        if (updates.displayName() != null && !updates.displayName().isBlank()) user.setDisplayName(updates.displayName().trim());
        if (updates.heightCm() != null) user.setHeightCm(updates.heightCm());
        if (updates.weightKg() != null) user.setWeightKg(updates.weightKg());
        if (updates.age() != null) user.setAge(updates.age());
        if (updates.sex() != null) user.setSex(updates.sex());
        if (updates.activityLevel() != null) user.setActivityLevel(updates.activityLevel());
        if (updates.customDailyCalories() != null) user.setCustomDailyCalories(updates.customDailyCalories());
        return userRepository.save(user);
    }

    public Map<String, Object> metrics() {
        User user = currentUser.get();
        double bmr = 0;
        if (user.getAge() != null && user.getWeightKg() != null && user.getHeightCm() != null && user.getSex() != null) {
            double base = 10 * user.getWeightKg() + 6.25 * user.getHeightCm() - 5 * user.getAge();
            bmr = user.getSex() == User.Sex.MALE ? base + 5 : base - 161;
        }
        double tdee = bmr * activityMultiplier(user.getActivityLevel());
        double dailyGoal = user.getCustomDailyCalories() != null
                ? user.getCustomDailyCalories()
                : Math.round(tdee);
        return Map.of(
                "bmr", (int) Math.round(bmr),
                "tdee", (int) Math.round(tdee),
                "dailyGoal", (int) Math.round(dailyGoal),
                "profile", ProfileView.of(user)
        );
    }

    private double activityMultiplier(User.ActivityLevel level) {
        if (level == null) return 1.375;
        return switch (level) {
            case SEDENTARY -> 1.2;
            case LIGHT -> 1.375;
            case MODERATE -> 1.55;
            case ACTIVE -> 1.725;
            case VERY_ACTIVE -> 1.9;
        };
    }
}