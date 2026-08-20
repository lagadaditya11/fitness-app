package com.fitness.tracker.workout;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {

    List<WorkoutSession> findByUserIdOrderByDateDesc(Long userId);

    Optional<WorkoutSession> findByIdAndUserId(Long id, Long userId);

    @Query("""
        SELECT ws FROM WorkoutSession ws
        WHERE ws.userId = :userId AND ws.date BETWEEN :from AND :to
        ORDER BY ws.date ASC
        """)
    List<WorkoutSession> findBetween(@Param("userId") Long userId,
                                     @Param("from") LocalDate from,
                                     @Param("to") LocalDate to);
}