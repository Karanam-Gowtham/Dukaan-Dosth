package com.Dukaan_Dost.backend.DTOs;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ParseTransactionRequest {

    @NotBlank(message = "Text to parse is required")
    private String rawInput;

    /** "en" or "te" — defaults to en */
    private String language;
}
