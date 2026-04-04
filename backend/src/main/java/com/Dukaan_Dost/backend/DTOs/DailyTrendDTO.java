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
public class DailyTrendDTO {

    private LocalDate date;
    private Double sales;
    private Double expenses;
    private Double profit;
}
