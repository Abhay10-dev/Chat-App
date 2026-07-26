package com.lazyCoder.chat_app_backend.service;

import com.lazyCoder.chat_app_backend.dto.AuthRequestDTO;
import com.lazyCoder.chat_app_backend.dto.AuthResponseDTO;
import com.lazyCoder.chat_app_backend.model.User;
import com.lazyCoder.chat_app_backend.repo.UserRepository;
import com.lazyCoder.chat_app_backend.security.JwtTokenProvider;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;


    public AuthResponseDTO register(AuthRequestDTO request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }

        User user = User.builder()
                .username(request.getUsername().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getUsername());
        return new AuthResponseDTO(token, user.getUsername());
    }

    public AuthResponseDTO login(AuthRequestDTO request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String token = tokenProvider.generateToken(user.getUsername());
        return new AuthResponseDTO(token, user.getUsername());
    }
}
