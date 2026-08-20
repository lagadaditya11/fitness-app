package com.fitness.tracker.foodlog;

import com.fitness.tracker.food.Food;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "food_logs")
public class FoodLog {

    public enum MealType { BREAKFAST, LUNCH, DINNER, SNACK }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDate date;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    private Food food;

    @Column(nullable = false)
    private Double grams;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MealType mealType;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Food getFood() { return food; }
    public void setFood(Food food) { this.food = food; }
    public Double getGrams() { return grams; }
    public void setGrams(Double grams) { this.grams = grams; }
    public MealType getMealType() { return mealType; }
    public void setMealType(MealType mealType) { this.mealType = mealType; }
}