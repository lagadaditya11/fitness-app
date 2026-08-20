package com.fitness.tracker.workout;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    @Query("""
        SELECT e FROM Exercise e
        WHERE (e.ownerId IS NULL OR e.ownerId = :ownerId)
          AND lower(e.name) LIKE lower(CONCAT('%', :q, '%'))
        ORDER BY e.name ASC
        """)
    List<Exercise> search(@Param("q") String q, @Param("ownerId") Long ownerId);
}