package com.Dukaan_Dost.backend.Service;

import com.Dukaan_Dost.backend.DTOs.BusinessHealthDTO;
import com.Dukaan_Dost.backend.DTOs.DailyTrendDTO;
import com.Dukaan_Dost.backend.DTOs.WeeklyAnalyticsDTO;
import com.Dukaan_Dost.backend.Repos.ExpenseRepository;
import com.Dukaan_Dost.backend.Repos.InventoryRepository;
import com.Dukaan_Dost.backend.Repos.SaleRepository;
import com.Dukaan_Dost.backend.Repos.UdhaarRepository;
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
    private final UdhaarRepository udhaarRepository;
    private final InventoryRepository inventoryRepository;
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

    /**
     * Composite 0–100 score for dashboard “business pulse” (last 7 days + working capital signals).
     */
    public BusinessHealthDTO getBusinessHealth() {
        Long userId = authUtil.getCurrentUserId();
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(6);
        WeeklyAnalyticsDTO week = buildWeeklyAnalytics(userId, start, today);

        double sales = week.getTotalSales() != null ? week.getTotalSales() : 0;
        double expenses = week.getTotalExpenses() != null ? week.getTotalExpenses() : 0;
        double profit = week.getTotalProfit() != null ? week.getTotalProfit() : 0;
        Double pendingRaw = udhaarRepository.sumPendingAmountByUserId(userId);
        double pending = pendingRaw != null ? pendingRaw : 0;
        int lowStock = inventoryRepository.findLowStockItems(userId).size();

        double margin = sales > 0 ? Math.max(0, Math.min(1, profit / sales)) : (profit > 0 ? 1 : 0);
        double costControl = sales > 0 ? Math.max(0, Math.min(1, 1 - expenses / sales)) : 0.5;
        double udhaarPressure = sales > 0 ? Math.max(0, Math.min(1, 1 - pending / (sales * 1.5))) : 1;
        double stockPenalty = Math.max(0, 1 - Math.min(lowStock, 10) / 10.0);

        int score = (int) Math.round(
                margin * 38 + costControl * 32 + udhaarPressure * 20 + stockPenalty * 10);
        score = Math.max(0, Math.min(100, score));

        String label;
        String headline;
        if (score >= 75) {
            label = "Thriving";
            headline = "Strong week — margins and cash signals look healthy.";
        } else if (score >= 50) {
            label = "Stable";
            headline = "On track — watch expenses and pending udhaar this week.";
        } else {
            label = "Needs attention";
            headline = "Tighten costs, collect udhaar, or restock critical items.";
        }

        return BusinessHealthDTO.builder()
                .score(score)
                .label(label)
                .headline(headline)
                .weeklySales(sales)
                .weeklyExpenses(expenses)
                .weeklyProfit(profit)
                .pendingUdhaar(pending)
                .lowStockCount(lowStock)
                .build();
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
