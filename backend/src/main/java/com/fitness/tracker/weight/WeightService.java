package com.fitness.tracker.weight;

import com.fitness.tracker.config.CurrentUser;
import com.fitness.tracker.user.User;
import com.fitness.tracker.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class WeightService {

    public record WeightPoint(String date, double weightKg) {}

    private final WeightLogRepository weightLogRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    public WeightService(WeightLogRepository weightLogRepository, UserRepository userRepository, CurrentUser currentUser) {
        this.weightLogRepository = weightLogRepository;
        this.userRepository = userRepository;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public List<WeightPoint> history(int days) {
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(Math.max(1, days) - 1L);
        return weightLogRepository.findByUserAndDateBetweenOrderByDateAsc(currentUser.get(), from, to).stream()
                .map(w -> new WeightPoint(w.getDate().toString(), w.getWeightKg()))
                .toList();
    }

    @Transactional
    public WeightPoint upsert(LocalDate date, double weightKg) {
        if (weightKg <= 0 || weightKg > 500) {
            throw new IllegalArgumentException("Weight must be between 0 and 500 kg");
        }
        User user = currentUser.get();

        WeightLog log = weightLogRepository.findByUserAndDate(user, date).orElseGet(() -> {
            WeightLog w = new WeightLog();
            w.setUser(user);
            w.setDate(date);
            return w;
        });
        log.setWeightKg(weightKg);
        weightLogRepository.save(log);

        // Keep the profile's current weight in sync, but only when this entry
        // is the most recent one (editing an older day must not overwrite it)
        weightLogRepository.findFirstByUserOrderByDateDesc(user)
                .filter(latest -> !latest.getDate().isAfter(date))
                .ifPresent(latest -> {
                    user.setWeightKg(latest.getWeightKg());
                    userRepository.save(user);
                });

        return new WeightPoint(date.toString(), weightKg);
    }
}
