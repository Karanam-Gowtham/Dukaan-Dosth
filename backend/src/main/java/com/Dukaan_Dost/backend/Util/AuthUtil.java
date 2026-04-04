package com.Dukaan_Dost.backend.Util;

import com.Dukaan_Dost.backend.Model.User;
import com.Dukaan_Dost.backend.Repos.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthUtil {

    private final UserRepository userRepository;

    /**
     * Get the currently authenticated user from the JWT security context
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }

        String phone;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            phone = userDetails.getUsername();
        } else {
            phone = principal.toString();
        }

        return userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Get the current user's ID
     */
    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
