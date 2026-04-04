package com.Dukaan_Dost.backend.DTOs;

import lombok.Data;

@Data
public class AIQueryRequest {
    private String query;
    private String language; // "en" or "te"
}
