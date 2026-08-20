package com.fitness.tracker.workout;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, Long> {

    List<WorkoutSet> findBySessionId(Long sessionId);
}