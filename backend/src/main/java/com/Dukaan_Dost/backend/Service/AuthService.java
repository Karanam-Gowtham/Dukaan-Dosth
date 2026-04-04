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
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    // ✅ REGISTER
    @Transactional
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

        User saved = userRepository.saveAndFlush(user);
        Long id = saved.getId();
        if (id == null) {
            throw new IllegalStateException("User was not assigned an id after save");
        }

        String token = jwtService.generateToken(saved.getPhone(), id);
        return authPayload(token, saved, "User registered successfully");
    }

    // ✅ LOGIN - now returns JWT token
    @Transactional(readOnly = true)
    public Map<String, Object> login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getPhone(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new IllegalStateException("Authenticated user missing from database"));

        Long id = user.getId();
        if (id == null) {
            throw new IllegalStateException("User record has no id");
        }

        String token = jwtService.generateToken(user.getPhone(), id);
        return authPayload(token, user, "Login successful");
    }

    private static Map<String, Object> authPayload(String token, User user, String message) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("token", token);
        m.put("userId", user.getId());
        m.put("name", user.getName());
        m.put("phone", user.getPhone());
        m.put("shopName", user.getShopName());
        m.put("message", message);
        return m;
    }
}