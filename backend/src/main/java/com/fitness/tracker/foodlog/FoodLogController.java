package com.fitness.tracker.foodlog;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/foodlog")
public class FoodLogController {

    private final FoodLogService foodLogService;

    public FoodLogController(FoodLogService foodLogService) {
        this.foodLogService = foodLogService;
    }

    @PostMapping
    public FoodLog log(@RequestBody FoodLog request,
                       @RequestParam Long foodId) {
        return foodLogService.log(request, foodId);
    }

    @GetMapping("/day")
    public DaySummary day(@RequestParam(required = false) LocalDate date) {
        return foodLogService.summary(date == null ? LocalDate.now() : date);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        foodLogService.delete(id);
        return ResponseEntity.noContent().build();
    }
}