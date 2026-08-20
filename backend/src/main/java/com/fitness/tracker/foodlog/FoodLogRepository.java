package com.fitness.tracker.foodlog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface FoodLogRepository extends JpaRepository<FoodLog, Long> {

    List<FoodLog> findByUserIdAndDateOrderByMealTypeAsc(Long userId, LocalDate date);

    @Query("""
        SELECT fl FROM FoodLog fl
        WHERE fl.userId = :userId AND fl.date BETWEEN :from AND :to
        ORDER BY fl.date ASC
        """)
    List<FoodLog> findBetween(@Param("userId") Long userId,
                              @Param("from") LocalDate from,
                              @Param("to") LocalDate to);
}