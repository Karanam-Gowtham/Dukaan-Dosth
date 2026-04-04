package com.Dukaan_Dost.backend.DTOs;

import com.Dukaan_Dost.backend.Model.ExpenseCategory;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ExpenseRequestDTO {

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;

    private String description;

    private ExpenseCategory category;
}
