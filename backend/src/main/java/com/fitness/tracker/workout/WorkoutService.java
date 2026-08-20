package com.fitness.tracker.workout;

import com.fitness.tracker.config.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class WorkoutService {

    private final WorkoutSessionRepository sessionRepository;
    private final WorkoutSetRepository setRepository;
    private final ExerciseRepository exerciseRepository;
    private final CurrentUser currentUser;

    public WorkoutService(WorkoutSessionRepository sessionRepository,
                          WorkoutSetRepository setRepository,
                          ExerciseRepository exerciseRepository,
                          CurrentUser currentUser) {
        this.sessionRepository = sessionRepository;
        this.setRepository = setRepository;
        this.exerciseRepository = exerciseRepository;
        this.currentUser = currentUser;
    }

    public WorkoutSession createSession(WorkoutSession session) {
        Long userId = currentUser.get().getId();
        session.setId(null);
        session.setUserId(userId);
        return sessionRepository.save(session);
    }

    public List<WorkoutSession> mySessions() {
        return sessionRepository.findByUserIdOrderByDateDesc(currentUser.get().getId());
    }

    public SessionDetail getSession(Long sessionId) {
        Long userId = currentUser.get().getId();
        WorkoutSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        return new SessionDetail(session, setRepository.findBySessionId(sessionId));
    }

    public WorkoutSet addSet(Long sessionId, WorkoutSet set, Long exerciseId) {
        Long userId = currentUser.get().getId();
        WorkoutSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found"));
        set.setId(null);
        set.setSession(session);
        set.setExercise(exercise);
        long count = setRepository.findBySessionId(sessionId).size();
        set.setSetNumber((int) count + 1);
        return setRepository.save(set);
    }

    @Transactional
    public void deleteSet(Long sessionId, Long setId) {
        WorkoutSession session = sessionRepository.findByIdAndUserId(sessionId, currentUser.get().getId())
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        setRepository.deleteById(setId);
    }

    public double estimateCaloriesBurned(Long sessionId) {
        List<WorkoutSet> sets = setRepository.findBySessionId(sessionId);
        double totalVolumeKg = sets.stream()
                .mapToDouble(s -> (s.getWeightKg() == null ? 0 : s.getWeightKg())
                        * (s.getReps() == null ? 0 : s.getReps()))
                .sum();
        return Math.round(totalVolumeKg * 0.05 * 10) / 10.0;
    }

    public List<Exercise> searchExercises(String q) {
        return exerciseRepository.search(q.trim(), currentUser.get().getId());
    }

    public Exercise createExercise(Exercise exercise) {
        exercise.setId(null);
        exercise.setOwnerId(currentUser.get().getId());
        exercise.setCustom(true);
        return exerciseRepository.save(exercise);
    }

    public record SessionDetail(WorkoutSession session, List<WorkoutSet> sets) {
    }
}