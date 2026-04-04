package com.Dukaan_Dost.backend.DTOs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySummaryDTO {

    private LocalDate date;
    private Double totalSales;
    private Double totalExpenses;
    private Double profit;
    private int salesCount;
    private int expensesCount;
    private Double pendingUdhaar;
    private int lowStockItemsCount;
}
