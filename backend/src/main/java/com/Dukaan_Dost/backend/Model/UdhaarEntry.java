package com.Dukaan_Dost.backend.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "udhaar_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UdhaarEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String customerName;

    private String customerPhone;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    @Builder.Default
    private Double pendingAmount = 0.0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UdhaarStatus status = UdhaarStatus.PENDING;

    private String description;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Long userId;

    @OneToMany(mappedBy = "udhaarEntry", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<UdhaarPayment> payments = new ArrayList<>();

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
