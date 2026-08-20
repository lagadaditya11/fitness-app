package com.fitness.tracker.workout;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @GetMapping("/sessions")
    public List<WorkoutSession> sessions() {
        return workoutService.mySessions();
    }

    @PostMapping("/sessions")
    public WorkoutSession createSession(@RequestBody WorkoutSession session) {
        return workoutService.createSession(session);
    }

    @GetMapping("/sessions/{id}")
    public WorkoutService.SessionDetail session(@PathVariable Long id) {
        return workoutService.getSession(id);
    }

    @PostMapping("/sessions/{id}/sets")
    public WorkoutSet addSet(@PathVariable Long id,
                             @RequestBody WorkoutSet set,
                             @RequestParam Long exerciseId) {
        return workoutService.addSet(id, set, exerciseId);
    }

    @DeleteMapping("/sessions/{sessionId}/sets/{setId}")
    public ResponseEntity<Void> deleteSet(@PathVariable Long sessionId, @PathVariable Long setId) {
        workoutService.deleteSet(sessionId, setId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sessions/{id}/calories")
    public double calories(@PathVariable Long id) {
        return workoutService.estimateCaloriesBurned(id);
    }

    @GetMapping("/exercises/search")
    public List<Exercise> searchExercises(@RequestParam(defaultValue = "") String q) {
        return workoutService.searchExercises(q);
    }

    @PostMapping("/exercises")
    public Exercise createExercise(@RequestBody Exercise exercise) {
        return workoutService.createExercise(exercise);
    }
}