package com.Dukaan_Dost.backend.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class UdhaarPaymentDTO {

    @NotNull(message = "Payment amount is required")
    @Positive(message = "Payment amount must be positive")
    private Double amount;

    private String note;
}
