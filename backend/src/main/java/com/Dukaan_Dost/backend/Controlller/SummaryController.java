package com.Dukaan_Dost.backend.Controlller;

import com.Dukaan_Dost.backend.DTOs.AISummaryResponseDTO;
import com.Dukaan_Dost.backend.DTOs.ApiResponse;
import com.Dukaan_Dost.backend.DTOs.DailySummaryDTO;
import com.Dukaan_Dost.backend.Service.SummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/summary")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    // ✅ Get today's AI summary
    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<AISummaryResponseDTO>> getTodaySummary() {
        AISummaryResponseDTO summary = summaryService.getDailySummary(LocalDate.now());
        return ResponseEntity.ok(ApiResponse.success("Daily AI summary", summary));
    }

    // ✅ Get AI summary for specific date
    @GetMapping("/daily/{date}")
    public ResponseEntity<ApiResponse<AISummaryResponseDTO>> getSummaryByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        AISummaryResponseDTO summary = summaryService.getDailySummary(date);
        return ResponseEntity.ok(ApiResponse.success("AI summary for " + date, summary));
    }

    // ✅ Get raw summary without AI (faster)
    @GetMapping("/raw")
    public ResponseEntity<ApiResponse<DailySummaryDTO>> getRawSummary() {
        DailySummaryDTO summary = summaryService.getRawDailySummary(LocalDate.now());
        return ResponseEntity.ok(ApiResponse.success("Today's business summary", summary));
    }

    // ✅ Get raw summary for specific date
    @GetMapping("/raw/{date}")
    public ResponseEntity<ApiResponse<DailySummaryDTO>> getRawSummaryByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DailySummaryDTO summary = summaryService.getRawDailySummary(date);
        return ResponseEntity.ok(ApiResponse.success("Business summary for " + date, summary));
    }
}
