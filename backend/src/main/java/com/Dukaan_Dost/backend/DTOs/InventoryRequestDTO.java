package com.Dukaan_Dost.backend.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class InventoryRequestDTO {

    @NotBlank(message = "Item name is required")
    private String name;

    @PositiveOrZero(message = "Quantity cannot be negative")
    private Integer quantity;

    private String unit;

    private Integer minStockLevel;

    private Double price;

    private Double costPrice;
}
