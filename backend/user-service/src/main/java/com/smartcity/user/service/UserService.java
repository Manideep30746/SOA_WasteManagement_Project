package com.smartcity.user.service;

import com.smartcity.user.dto.RegisterRequest;
import com.smartcity.user.entity.Role;
import com.smartcity.user.entity.User;
import com.smartcity.user.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // Never store the plain-text password
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // Every new user is a Citizen by default
        user.setRole(Role.CITIZEN);

        return userRepository.save(user);
    }
}