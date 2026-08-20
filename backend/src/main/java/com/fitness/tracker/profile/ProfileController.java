package com.fitness.tracker.profile;

import com.fitness.tracker.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public Map<String, Object> metrics() {
        return profileService.metrics();
    }

    @PutMapping
    public ResponseEntity<User> update(@RequestBody User updates) {
        return ResponseEntity.ok(profileService.update(updates));
    }
}