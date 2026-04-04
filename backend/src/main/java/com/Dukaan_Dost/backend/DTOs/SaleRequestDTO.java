package com.Dukaan_Dost.backend.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class SaleRequestDTO {

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;

    private String description;

    // Optional: item-wise sale
    private List<SaleItemDTO> items;
}