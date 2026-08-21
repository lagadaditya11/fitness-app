package com.fitness.tracker.weight;

import com.fitness.tracker.weight.WeightService.WeightPoint;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/weight")
public class WeightController {

    private final WeightService weightService;

    public WeightController(WeightService weightService) {
        this.weightService = weightService;
    }

    @GetMapping
    public List<WeightPoint> history(@RequestParam(defaultValue = "90") int days) {
        return weightService.history(days);
    }

    @PostMapping
    public WeightPoint upsert(@RequestBody Map<String, String> body) {
        LocalDate date = LocalDate.parse(body.getOrDefault("date", LocalDate.now().toString()));
        double weightKg = Double.parseDouble(body.get("weightKg"));
        return weightService.upsert(date, weightKg);
    }
}
