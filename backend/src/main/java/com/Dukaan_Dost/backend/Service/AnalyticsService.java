package com.Dukaan_Dost.backend.Service;

import com.Dukaan_Dost.backend.DTOs.DailyTrendDTO;
import com.Dukaan_Dost.backend.DTOs.WeeklyAnalyticsDTO;
import com.Dukaan_Dost.backend.Repos.ExpenseRepository;
import com.Dukaan_Dost.backend.Repos.SaleRepository;
import com.Dukaan_Dost.backend.Util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final SaleRepository saleRepository;
    private final ExpenseRepository expenseRepository;
    private final AuthUtil authUtil;

    /**
     * Get weekly analytics with daily trend breakdown
     */
    public WeeklyAnalyticsDTO getWeeklyAnalytics() {
        Long userId = authUtil.getCurrentUserId();
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = today; // up to today

        return buildWeeklyAnalytics(userId, startOfWeek, endOfWeek);
    }

    /**
     * Get profit/loss data for the last 7 days
     */
    public WeeklyAnalyticsDTO getProfitLossData() {
        Long userId = authUtil.getCurrentUserId();
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(6);

        return buildWeeklyAnalytics(userId, sevenDaysAgo, today);
    }

    /**
     * Get analytics for a custom date range
     */
    public WeeklyAnalyticsDTO getAnalyticsByDateRange(LocalDate startDate, LocalDate endDate) {
        Long userId = authUtil.getCurrentUserId();
        return buildWeeklyAnalytics(userId, startDate, endDate);
    }

    private WeeklyAnalyticsDTO buildWeeklyAnalytics(Long userId, LocalDate startDate, LocalDate endDate) {
        Double totalSales = saleRepository.sumAmountByUserIdAndDateBetween(userId, startDate, endDate);
        Double totalExpenses = expenseRepository.sumAmountByUserIdAndDateBetween(userId, startDate, endDate);
        Double totalProfit = totalSales - totalExpenses;

        // Build daily trends
        List<DailyTrendDTO> dailyTrends = new ArrayList<>();
        LocalDate current = startDate;
        int dayCount = 0;

        while (!current.isAfter(endDate)) {
            Double daySales = saleRepository.sumAmountByUserIdAndDate(userId, current);
            Double dayExpenses = expenseRepository.sumAmountByUserIdAndDate(userId, current);
            Double dayProfit = daySales - dayExpenses;

            dailyTrends.add(DailyTrendDTO.builder()
                    .date(current)
                    .sales(daySales)
                    .expenses(dayExpenses)
                    .profit(dayProfit)
                    .build());

            current = current.plusDays(1);
            dayCount++;
        }

        double avgSales = dayCount > 0 ? totalSales / dayCount : 0;
        double avgExpenses = dayCount > 0 ? totalExpenses / dayCount : 0;
        double avgProfit = dayCount > 0 ? totalProfit / dayCount : 0;

        return WeeklyAnalyticsDTO.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalSales(totalSales)
                .totalExpenses(totalExpenses)
                .totalProfit(totalProfit)
                .avgDailySales(Math.round(avgSales * 100.0) / 100.0)
                .avgDailyExpenses(Math.round(avgExpenses * 100.0) / 100.0)
                .avgDailyProfit(Math.round(avgProfit * 100.0) / 100.0)
                .dailyTrends(dailyTrends)
                .build();
    }
}
