package com.Dukaan_Dost.backend.Model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "daily_summaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailySummary {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "summary_date", nullable = false)
    private LocalDate summaryDate;

    @Column(name = "total_sales", precision = 12, scale = 2)
    private BigDecimal totalSales;

    @Column(name = "total_expenses", precision = 12, scale = 2)
    private BigDecimal totalExpenses;

    @Column(name = "net_profit", precision = 12, scale = 2)
    private BigDecimal netProfit;

    @Column(name = "total_credit_given", precision = 12, scale = 2)
    private BigDecimal totalCreditGiven;

    @Column(name = "total_credit_received", precision = 12, scale = 2)
    private BigDecimal totalCreditReceived;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
