package com.fitness.tracker.foodlog;

import com.fitness.tracker.food.Food;
import com.fitness.tracker.food.FoodRepository;
import com.fitness.tracker.config.CurrentUser;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class FoodLogService {

    private final FoodLogRepository foodLogRepository;
    private final FoodRepository foodRepository;
    private final CurrentUser currentUser;

    public FoodLogService(FoodLogRepository foodLogRepository, FoodRepository foodRepository, CurrentUser currentUser) {
        this.foodLogRepository = foodLogRepository;
        this.foodRepository = foodRepository;
        this.currentUser = currentUser;
    }

    public FoodLog log(FoodLog request, Long foodId) {
        Food food = foodRepository.findById(foodId)
                .orElseThrow(() -> new IllegalArgumentException("Food not found"));
        request.setId(null);
        request.setUserId(currentUser.get().getId());
        request.setFood(food);
        if (request.getDate() == null) request.setDate(LocalDate.now());
        return foodLogRepository.save(request);
    }

    public DaySummary summary(LocalDate date) {
        Long userId = currentUser.get().getId();
        List<FoodLog> logs = foodLogRepository.findByUserIdAndDateOrderByMealTypeAsc(userId, date);

        Map<String, List<DaySummary.Entry>> byMeal = new LinkedHashMap<>();
        double calories = 0, protein = 0, carbs = 0, fat = 0;
        for (FoodLog log : logs) {
            Food f = log.getFood();
            double factor = log.getGrams() / 100.0;
            double kcal = f.getCaloriesPer100g() * factor;
            double p = (f.getProteinPer100g() == null ? 0 : f.getProteinPer100g()) * factor;
            double c = (f.getCarbsPer100g() == null ? 0 : f.getCarbsPer100g()) * factor;
            double ft = (f.getFatPer100g() == null ? 0 : f.getFatPer100g()) * factor;
            calories += kcal; protein += p; carbs += c; fat += ft;
            byMeal.computeIfAbsent(log.getMealType().name(), k -> new ArrayList<>())
                    .add(new DaySummary.Entry(log.getId(), f.getName(), log.getGrams(),
                            round(kcal), round(p), round(c), round(ft), log.getMealType().name()));
        }
        return new DaySummary(date.toString(), round(calories), round(protein), round(carbs), round(fat), byMeal);
    }

    public void delete(Long id) {
        foodLogRepository.deleteById(id);
    }

    private double round(double v) {
        return Math.round(v * 10) / 10.0;
    }
}