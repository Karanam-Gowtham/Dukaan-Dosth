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
public class AISummaryResponseDTO {

    private LocalDate date;
    private Double totalSales;
    private Double totalExpenses;
    private Double profit;
    private String summary;    // Full summary text
    private String insight;    // One-line insight
    private String suggestion; // One-line suggestion
    private String language;   // te or en
}
