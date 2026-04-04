package com.Dukaan_Dost.backend.Controlller;

import com.Dukaan_Dost.backend.DTOs.ApiResponse;
import com.Dukaan_Dost.backend.DTOs.BusinessHealthDTO;
import com.Dukaan_Dost.backend.DTOs.WeeklyAnalyticsDTO;
import com.Dukaan_Dost.backend.Service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    // ✅ Get weekly analytics (current week Mon-today)
    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<WeeklyAnalyticsDTO>> getWeeklyAnalytics() {
        WeeklyAnalyticsDTO analytics = analyticsService.getWeeklyAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Weekly analytics", analytics));
    }

    // ✅ Get profit/loss chart data (last 7 days)
    @GetMapping("/profit-loss")
    public ResponseEntity<ApiResponse<WeeklyAnalyticsDTO>> getProfitLoss() {
        WeeklyAnalyticsDTO analytics = analyticsService.getProfitLossData();
        return ResponseEntity.ok(ApiResponse.success("Profit/Loss data", analytics));
    }

    // ✅ Get analytics for custom date range
    @GetMapping("/range")
    public ResponseEntity<ApiResponse<WeeklyAnalyticsDTO>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        WeeklyAnalyticsDTO analytics = analyticsService.getAnalyticsByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Analytics for range", analytics));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<BusinessHealthDTO>> getBusinessHealth() {
        return ResponseEntity.ok(ApiResponse.success("Business health", analyticsService.getBusinessHealth()));
    }
}
