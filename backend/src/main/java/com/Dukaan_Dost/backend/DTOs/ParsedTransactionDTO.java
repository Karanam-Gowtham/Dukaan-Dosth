package com.Dukaan_Dost.backend.DTOs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParsedTransactionDTO {

    private String type;
    private Double amount;
    private String description;
    private String category;
    private String customerName;
    private Double confidence;
}
