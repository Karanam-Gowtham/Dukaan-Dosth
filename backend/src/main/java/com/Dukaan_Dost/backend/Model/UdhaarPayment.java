package com.Dukaan_Dost.backend.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "udhaar_payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UdhaarPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private LocalDate paymentDate;

    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "udhaar_entry_id", nullable = false)
    @JsonIgnore
    private UdhaarEntry udhaarEntry;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
