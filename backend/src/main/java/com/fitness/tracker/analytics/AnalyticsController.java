package com.fitness.tracker.analytics;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/daily")
    public List<AnalyticsService.DayPoint> daily(@RequestParam(defaultValue = "30") int days) {
        return analyticsService.dailySeries(days);
    }

    @GetMapping("/streak")
    public Map<String, Double> streak() {
        return Map.of("streak", analyticsService.currentStreak());
    }
}