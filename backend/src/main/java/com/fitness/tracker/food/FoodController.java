package com.fitness.tracker.food;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
public class FoodController {

    private final FoodService foodService;

    public FoodController(FoodService foodService) {
        this.foodService = foodService;
    }

    @GetMapping("/search")
    public List<Food> search(@RequestParam(defaultValue = "") String q) {
        return foodService.search(q);
    }

    @GetMapping
    public List<Food> mine() {
        return foodService.myFoods();
    }

    @PostMapping
    public Food create(@RequestBody Food food) {
        return foodService.create(food);
    }
}