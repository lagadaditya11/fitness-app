package com.fitness.tracker.auth;

import com.fitness.tracker.config.JwtService;
import com.fitness.tracker.user.User;
import com.fitness.tracker.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.displayName().trim());
        if (request.heightCm() != null) user.setHeightCm(request.heightCm());
        if (request.weightKg() != null) user.setWeightKg(request.weightKg());
        if (request.age() != null) user.setAge(request.age());
        if (request.sex() != null) user.setSex(User.Sex.valueOf(request.sex()));
        if (request.activityLevel() != null) user.setActivityLevel(User.ActivityLevel.valueOf(request.activityLevel()));
        userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(user.getId(), user.getEmail()), user.getEmail(), user.getDisplayName());
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        return new AuthResponse(jwtService.generateToken(user.getId(), user.getEmail()), user.getEmail(), user.getDisplayName());
    }
}