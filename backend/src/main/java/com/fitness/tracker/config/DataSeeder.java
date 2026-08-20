package com.fitness.tracker.config;

import com.fitness.tracker.food.Food;
import com.fitness.tracker.food.FoodRepository;
import com.fitness.tracker.workout.Exercise;
import com.fitness.tracker.workout.ExerciseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    private final FoodRepository foodRepository;
    private final ExerciseRepository exerciseRepository;

    public DataSeeder(FoodRepository foodRepository, ExerciseRepository exerciseRepository) {
        this.foodRepository = foodRepository;
        this.exerciseRepository = exerciseRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (foodRepository.count() == 0) {
            seedFood("Chicken breast", 165, 31, 0, 3.6);
            seedFood("White rice (cooked)", 130, 2.7, 28, 0.3);
            seedFood("Brown rice (cooked)", 112, 2.6, 24, 0.9);
            seedFood("Egg", 155, 13, 1.1, 11);
            seedFood("Banana", 89, 1.1, 23, 0.3);
            seedFood("Apple", 52, 0.3, 14, 0.2);
            seedFood("Oatmeal", 389, 16.9, 66, 6.9);
            seedFood("Greek yogurt", 59, 10, 3.6, 0.4);
            seedFood("Salmon", 208, 20, 0, 13);
            seedFood("Broccoli", 34, 2.8, 7, 0.4);
            seedFood("Sweet potato", 86, 1.6, 20, 0.1);
            seedFood("Almonds", 579, 21, 22, 50);
            seedFood("Whey protein shake", 120, 24, 3, 1);
            seedFood("Whole wheat bread", 247, 13, 41, 3.4);
        }
        if (exerciseRepository.count() == 0) {
            seedExercise("Bench Press", "Chest");
            seedExercise("Squat", "Legs");
            seedExercise("Deadlift", "Back");
            seedExercise("Overhead Press", "Shoulders");
            seedExercise("Pull-up", "Back");
            seedExercise("Barbell Row", "Back");
            seedExercise("Lunges", "Legs");
            seedExercise("Bicep Curl", "Arms");
            seedExercise("Tricep Pushdown", "Arms");
            seedExercise("Plank", "Core");
            seedExercise("Lat Pulldown", "Back");
            seedExercise("Leg Press", "Legs");
        }
    }

    private void seedFood(String name, double kcal, double protein, double carbs, double fat) {
        Food f = new Food();
        f.setName(name);
        f.setCaloriesPer100g(kcal);
        f.setProteinPer100g(protein);
        f.setCarbsPer100g(carbs);
        f.setFatPer100g(fat);
        foodRepository.save(f);
    }

    private void seedExercise(String name, String muscleGroup) {
        Exercise e = new Exercise();
        e.setName(name);
        e.setMuscleGroup(muscleGroup);
        exerciseRepository.save(e);
    }
}