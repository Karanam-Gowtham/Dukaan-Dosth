package com.Dukaan_Dost.backend.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class UdhaarRequestDTO {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    private String customerPhone;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double totalAmount;

    private String description;
}
