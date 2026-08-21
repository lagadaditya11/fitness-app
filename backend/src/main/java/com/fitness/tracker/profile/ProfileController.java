package com.fitness.tracker.profile;

import jakarta.validation.Valid;
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
    public ResponseEntity<ProfileView> update(@Valid @RequestBody ProfileUpdateRequest updates) {
        return ResponseEntity.ok(ProfileView.of(profileService.update(updates)));
    }
}
