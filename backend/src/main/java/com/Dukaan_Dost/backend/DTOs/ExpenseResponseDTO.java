package com.Dukaan_Dost.backend.DTOs;

import com.Dukaan_Dost.backend.Model.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponseDTO {

    private Long id;
    private Double amount;
    private String description;
    private ExpenseCategory category;
    private LocalDate date;
    private LocalDateTime createdAt;
}
