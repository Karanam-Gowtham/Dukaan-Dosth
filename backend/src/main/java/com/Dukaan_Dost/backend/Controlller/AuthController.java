package com.Dukaan_Dost.backend.Controlller;

import com.Dukaan_Dost.backend.DTOs.ApiResponse;
import com.Dukaan_Dost.backend.DTOs.LoginRequest;
import com.Dukaan_Dost.backend.DTOs.RegisterRequest;
import com.Dukaan_Dost.backend.Service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@org.springframework.web.bind.annotation.CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class AuthController {

    private final AuthService authService;

    // ✅ REGISTER
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody RegisterRequest request) {
        Map<String, Object> result = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", result));
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginRequest request) {
        Map<String, Object> result = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", result));
    }
}