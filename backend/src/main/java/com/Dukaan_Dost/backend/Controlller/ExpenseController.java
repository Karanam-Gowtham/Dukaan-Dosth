package com.Dukaan_Dost.backend.Controlller;

import com.Dukaan_Dost.backend.DTOs.ApiResponse;
import com.Dukaan_Dost.backend.DTOs.ExpenseRequestDTO;
import com.Dukaan_Dost.backend.DTOs.ExpenseResponseDTO;
import com.Dukaan_Dost.backend.Service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    // ✅ Add Expense
    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponseDTO>> addExpense(@Valid @RequestBody ExpenseRequestDTO dto) {
        ExpenseResponseDTO expense = expenseService.addExpense(dto);
        return ResponseEntity.ok(ApiResponse.success("Expense added successfully", expense));
    }

    // ✅ Get today's expenses (fallback for root GET)
    @GetMapping
    public ResponseEntity<ApiResponse<List<ExpenseResponseDTO>>> getAllOrTodayExpenses() {
        return ResponseEntity.ok(ApiResponse.success(expenseService.getTodayExpenses()));
    }

    // ✅ Get today's expenses
    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<ExpenseResponseDTO>>> getTodayExpenses() {
        return ResponseEntity.ok(ApiResponse.success(expenseService.getTodayExpenses()));
    }

    // ✅ Get today's total expense
    @GetMapping("/today/total")
    public ResponseEntity<ApiResponse<Double>> getTodayTotal() {
        return ResponseEntity.ok(ApiResponse.success("Today's total expenses", expenseService.getTodayTotal()));
    }

    // ✅ Get expenses by date
    @GetMapping("/date/{date}")
    public ResponseEntity<ApiResponse<List<ExpenseResponseDTO>>> getExpensesByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(expenseService.getExpensesByDate(date)));
    }

    // ✅ Delete expense
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully", null));
    }
}
