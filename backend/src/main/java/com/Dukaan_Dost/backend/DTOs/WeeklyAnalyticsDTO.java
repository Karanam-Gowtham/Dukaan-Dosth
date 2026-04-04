package com.Dukaan_Dost.backend.DTOs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyAnalyticsDTO {

    private LocalDate startDate;
    private LocalDate endDate;
    private Double totalSales;
    private Double totalExpenses;
    private Double totalProfit;
    private Double avgDailySales;
    private Double avgDailyExpenses;
    private Double avgDailyProfit;
    private List<DailyTrendDTO> dailyTrends;
}
