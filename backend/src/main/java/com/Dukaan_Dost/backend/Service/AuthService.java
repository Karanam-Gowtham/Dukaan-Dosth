package com.Dukaan_Dost.backend.Service;

import com.Dukaan_Dost.backend.DTOs.LoginRequest;
import com.Dukaan_Dost.backend.DTOs.RegisterRequest;
import com.Dukaan_Dost.backend.JwtService;
import com.Dukaan_Dost.backend.Model.ROLEs;
import com.Dukaan_Dost.backend.Model.User;
import com.Dukaan_Dost.backend.Repos.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    // REGISTER
    public String register(RegisterRequest request) {

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("User already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword())) // 🔥 HASH HERE
                .role(ROLEs.USER)
                .isActive(true)
                .build();

        userRepository.save(user);

        return "User registered successfully";
    }

    // LOGIN
    public String login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getPhone(),
                        request.getPassword()
                )
        );

        // Generate and return a real JWT token
        var userDetails = userDetailsService.loadUserByUsername(request.getPhone());
        return jwtService.generateToken(userDetails);
    }
}