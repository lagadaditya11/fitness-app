package com.fitness.tracker.analytics;

import com.fitness.tracker.config.CurrentUser;
import com.fitness.tracker.foodlog.FoodLog;
import com.fitness.tracker.foodlog.FoodLogRepository;
import com.fitness.tracker.profile.ProfileService;
import com.fitness.tracker.workout.WorkoutSession;
import com.fitness.tracker.workout.WorkoutSessionRepository;
import com.fitness.tracker.workout.WorkoutSetRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final FoodLogRepository foodLogRepository;
    private final WorkoutSessionRepository sessionRepository;
    private final WorkoutSetRepository setRepository;
    private final CurrentUser currentUser;
    private final ProfileService profileService;

    public AnalyticsService(FoodLogRepository foodLogRepository,
                            WorkoutSessionRepository sessionRepository,
                            WorkoutSetRepository setRepository,
                            CurrentUser currentUser,
                            ProfileService profileService) {
        this.foodLogRepository = foodLogRepository;
        this.sessionRepository = sessionRepository;
        this.setRepository = setRepository;
        this.currentUser = currentUser;
        this.profileService = profileService;
    }

    public List<DayPoint> dailySeries(int days) {
        Long userId = currentUser.get().getId();
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(days - 1);

        double goal = (double) (int) profileService.metrics().get("dailyGoal");

        Map<LocalDate, DayPoint> points = new LinkedHashMap<>();
        for (int i = 0; i < days; i++) {
            LocalDate d = from.plusDays(i);
            points.put(d, new DayPoint(d.toString(), 0, 0, goal));
        }

        for (FoodLog fl : foodLogRepository.findBetween(userId, from, today)) {
            double factor = fl.getGrams() / 100.0;
            double kcal = fl.getFood().getCaloriesPer100g() * factor;
            points.get(fl.getDate()).caloriesIn += kcal;
        }

        for (WorkoutSession ws : sessionRepository.findBetween(userId, from, today)) {
            double burn = setRepository.findBySessionId(ws.getId()).stream()
                    .mapToDouble(s -> (s.getWeightKg() == null ? 0 : s.getWeightKg())
                            * (s.getReps() == null ? 0 : s.getReps()))
                    .sum() * 0.05;
            points.get(ws.getDate()).caloriesBurned += burn;
        }

        List<DayPoint> result = new ArrayList<>(points.values());
        for (DayPoint p : result) {
            p.caloriesIn = round(p.caloriesIn);
            p.caloriesBurned = round(p.caloriesBurned);
            p.goal = round(p.goal);
        }
        return result;
    }

    public double currentStreak() {
        Long userId = currentUser.get().getId();
        LocalDate day = LocalDate.now();
        int streak = 0;
        while (true) {
            List<FoodLog> logs = foodLogRepository.findByUserIdAndDateOrderByMealTypeAsc(userId, day);
            if (logs.isEmpty()) break;
            streak++;
            day = day.minusDays(1);
        }
        return streak;
    }

    private double round(double v) {
        return Math.round(v * 10) / 10.0;
    }

    public static class DayPoint {
        public String date;
        public double caloriesIn;
        public double caloriesBurned;
        public double goal;

        DayPoint(String date, double caloriesIn, double caloriesBurned, double goal) {
            this.date = date;
            this.caloriesIn = caloriesIn;
            this.caloriesBurned = caloriesBurned;
            this.goal = goal;
        }
    }
}