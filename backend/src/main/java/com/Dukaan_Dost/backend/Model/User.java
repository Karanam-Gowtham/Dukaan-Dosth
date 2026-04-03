package com.Dukaan_Dost.backend.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @Column(unique = true, nullable = false)
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be exactly 10 digits")
    private String phone;

    @Column( nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private ROLEs role; // USER / ADMIN

    @Builder.Default
    private boolean isActive = true;

    @Column(nullable = false)
    private String ShopName;
}