package com.Dukaan_Dost.backend.Service;

import com.Dukaan_Dost.backend.DTOs.LoginRequest;
import com.Dukaan_Dost.backend.DTOs.RegisterRequest;
import com.Dukaan_Dost.backend.JwtService;
import com.Dukaan_Dost.backend.Model.ROLEs;
import com.Dukaan_Dost.backend.Model.User;
import com.Dukaan_Dost.backend.Repos.UserRepository;
import com.Dukaan_Dost.backend.Exception.DuplicateResourceException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    // ✅ REGISTER
    public Map<String, Object> register(RegisterRequest request) {

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("User with this phone number already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(ROLEs.USER)
                .shopName(request.getShopName())
                .isActive(true)
                .build();

        userRepository.save(user);

        // Generate JWT token on registration too
        String token = jwtService.generateToken(user.getPhone(), user.getId());

        return Map.of(
                "token", token,
                "userId", user.getId(),
                "name", user.getName(),
                "phone", user.getPhone(),
                "shopName", user.getShopName(),
                "message", "User registered successfully"
        );
    }

    // ✅ LOGIN - now returns JWT token
    public Map<String, Object> login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getPhone(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user.getPhone(), user.getId());

        return Map.of(
                "token", token,
                "userId", user.getId(),
                "name", user.getName(),
                "phone", user.getPhone(),
                "shopName", user.getShopName(),
                "message", "Login successful"
        );
    }
}