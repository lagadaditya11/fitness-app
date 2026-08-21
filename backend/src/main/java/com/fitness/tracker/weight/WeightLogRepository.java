package com.fitness.tracker.weight;

import com.fitness.tracker.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WeightLogRepository extends JpaRepository<WeightLog, Long> {

    List<WeightLog> findByUserAndDateBetweenOrderByDateAsc(User user, LocalDate from, LocalDate to);

    Optional<WeightLog> findByUserAndDate(User user, LocalDate date);

    Optional<WeightLog> findFirstByUserOrderByDateDesc(User user);
}
