package com.Dukaan_Dost.backend.Controlller;

import com.Dukaan_Dost.backend.DTOs.ApiResponse;
import com.Dukaan_Dost.backend.DTOs.SaleRequestDTO;
import com.Dukaan_Dost.backend.DTOs.SaleResponseDTO;
import com.Dukaan_Dost.backend.Service.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    // ✅ Add Sale (total amount or item-wise)
    @PostMapping
    public ResponseEntity<ApiResponse<SaleResponseDTO>> addSale(@Valid @RequestBody SaleRequestDTO dto) {
        SaleResponseDTO sale = saleService.addSale(dto);
        return ResponseEntity.ok(ApiResponse.success("Sale added successfully", sale));
    }

    // ✅ Get today's sales (fallback for root GET)
    @GetMapping
    public ResponseEntity<ApiResponse<List<SaleResponseDTO>>> getAllOrTodaySales() {
        return ResponseEntity.ok(ApiResponse.success(saleService.getTodaySales()));
    }

    // ✅ Get today's sales
    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<SaleResponseDTO>>> getTodaySales() {
        return ResponseEntity.ok(ApiResponse.success(saleService.getTodaySales()));
    }

    // ✅ Get today's total
    @GetMapping("/today/total")
    public ResponseEntity<ApiResponse<Double>> getTodayTotal() {
        return ResponseEntity.ok(ApiResponse.success("Today's total sales", saleService.getTodayTotal()));
    }

    // ✅ Get sales by date
    @GetMapping("/date/{date}")
    public ResponseEntity<ApiResponse<List<SaleResponseDTO>>> getSalesByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(saleService.getSalesByDate(date)));
    }

    // ✅ Delete sale
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSale(@PathVariable Long id) {
        saleService.deleteSale(id);
        return ResponseEntity.ok(ApiResponse.success("Sale deleted successfully", null));
    }
}