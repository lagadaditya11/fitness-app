package com.fitness.tracker.foodlog;

import java.util.List;
import java.util.Map;

public record DaySummary(
        String date,
        double calories,
        double protein,
        double carbs,
        double fat,
        Map<String, List<Entry>> byMeal
) {
    public record Entry(Long id, String name, double grams,
                        double calories, double protein, double carbs, double fat, String mealType) {
    }
}