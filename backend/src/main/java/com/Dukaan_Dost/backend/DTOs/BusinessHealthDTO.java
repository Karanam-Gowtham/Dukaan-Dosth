package com.Dukaan_Dost.backend.DTOs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessHealthDTO {

    private int score;
    private String label;
    private String headline;
    private Double weeklySales;
    private Double weeklyExpenses;
    private Double weeklyProfit;
    private Double pendingUdhaar;
    private int lowStockCount;
}
