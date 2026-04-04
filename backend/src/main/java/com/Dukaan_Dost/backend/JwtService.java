package com.Dukaan_Dost.backend;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@RequiredArgsConstructor
@Service
public class JwtService {

    private final JwtConfig jwtConfig;

    private SecretKey getSigningKey() {
        String raw = jwtConfig.getSecret();
        if (raw == null || raw.isBlank()) {
            raw = "change-me-to-a-long-random-secret-for-local-dev-only";
        }
        raw = raw.trim();
        // Plain-text secrets (e.g. UUIDs, phrases with "-") are NOT Base64 — hashing avoids
        // "Illegal base64 character" from jjwt when JWT_SECRET is a normal random string.
        byte[] keyBytes;
        if (looksLikeStandardBase64(raw)) {
            try {
                byte[] decoded = Decoders.BASE64.decode(raw);
                keyBytes = decoded.length >= 32 ? decoded : sha256Bytes(raw);
            } catch (RuntimeException e) {
                keyBytes = sha256Bytes(raw);
            }
        } else {
            keyBytes = sha256Bytes(raw);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /** Standard Base64 alphabet only (+ / = padding). Hyphens, spaces, etc. => false. */
    private static boolean looksLikeStandardBase64(String s) {
        if (s.length() < 8) {
            return false;
        }
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            boolean ok = (c >= 'A' && c <= 'Z')
                    || (c >= 'a' && c <= 'z')
                    || (c >= '0' && c <= '9')
                    || c == '+'
                    || c == '/'
                    || c == '=';
            if (!ok) {
                return false;
            }
        }
        return true;
    }

    private static byte[] sha256Bytes(String s) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(s.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("Could not derive JWT signing key", e);
        }
    }

    // ✅ Generate JWT token
    public String generateToken(String username) {
        return generateToken(new HashMap<>(), username);
    }

    public String generateToken(Map<String, Object> extraClaims, String username) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtConfig.getExpiration()))
                .signWith(getSigningKey())
                .compact();
    }

    // ✅ Generate token with userId claim
    public String generateToken(String username, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        return generateToken(claims, username);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("userId", Long.class);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}