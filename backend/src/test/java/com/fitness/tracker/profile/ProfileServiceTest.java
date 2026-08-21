package com.fitness.tracker.profile;

import com.fitness.tracker.config.CurrentUser;
import com.fitness.tracker.user.User;
import com.fitness.tracker.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrentUser currentUser;

    @InjectMocks
    private ProfileService profileService;

    private User user(User.Sex sex, double weightKg, double heightCm, int age, User.ActivityLevel level) {
        User u = new User();
        u.setEmail("user@example.com");
        u.setPassword("x");
        u.setDisplayName("Test");
        u.setSex(sex);
        u.setWeightKg(weightKg);
        u.setHeightCm(heightCm);
        u.setAge(age);
        u.setActivityLevel(level);
        return u;
    }

    @Test
    void computesBmrAndTdeeForMale() {
        // Mifflin-St Jeor: 10*80 + 6.25*180 - 5*30 + 5 = 1780 kcal
        when(currentUser.get()).thenReturn(user(User.Sex.MALE, 80, 180, 30, User.ActivityLevel.MODERATE));
        Map<String, Object> metrics = profileService.metrics();

        assertThat(metrics.get("bmr")).isEqualTo(1780);
        // TDEE = 1780 * 1.55 = 2759
        assertThat(metrics.get("tdee")).isEqualTo(2759);
        assertThat(metrics.get("dailyGoal")).isEqualTo(2759);
    }

    @Test
    void computesBmrForFemale() {
        // Mifflin-St Jeor: 10*60 + 6.25*165 - 5*25 - 161 = 1345.25 -> 1345
        when(currentUser.get()).thenReturn(user(User.Sex.FEMALE, 60, 165, 25, User.ActivityLevel.LIGHT));
        Map<String, Object> metrics = profileService.metrics();

        assertThat(metrics.get("bmr")).isEqualTo(1345);
        // TDEE = 1345.25 * 1.375 = 1849.7 -> 1850
        assertThat(metrics.get("tdee")).isEqualTo(1850);
    }

    @Test
    void customGoalOverridesCalculatedTdee() {
        User u = user(User.Sex.MALE, 80, 180, 30, User.ActivityLevel.MODERATE);
        u.setCustomDailyCalories(2000);
        when(currentUser.get()).thenReturn(u);

        Map<String, Object> metrics = profileService.metrics();
        assertThat(metrics.get("dailyGoal")).isEqualTo(2000);
    }

    @Test
    void returnsZerosWhenBodyMetricsMissing() {
        User u = new User();
        u.setEmail("user@example.com");
        u.setPassword("x");
        u.setDisplayName("Test");
        when(currentUser.get()).thenReturn(u);

        Map<String, Object> metrics = profileService.metrics();
        assertThat(metrics.get("bmr")).isEqualTo(0);
        assertThat(metrics.get("tdee")).isEqualTo(0);
    }

    @Test
    void updateAppliesOnlyProvidedFields() {
        User existing = user(User.Sex.MALE, 80, 180, 30, User.ActivityLevel.MODERATE);
        existing.setDisplayName("Old Name");
        when(currentUser.get()).thenReturn(existing);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        ProfileUpdateRequest updates = new ProfileUpdateRequest(
                "New Name", null, 82.5, null, null, null, null);

        User saved = profileService.update(updates);

        assertThat(saved.getDisplayName()).isEqualTo("New Name");
        assertThat(saved.getHeightCm()).isEqualTo(180);      // unchanged
        assertThat(saved.getAge()).isEqualTo(30);            // unchanged
        assertThat(saved.getWeightKg()).isEqualTo(82.5);     // updated
        // Sensitive fields can never be touched through the profile endpoint
        assertThat(saved.getEmail()).isEqualTo("user@example.com");
        assertThat(saved.getPassword()).isEqualTo("x");
    }
}
