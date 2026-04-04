package com.Dukaan_Dost.backend.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double amount;

    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ExpenseCategory category = ExpenseCategory.OTHER;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Long userId;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
