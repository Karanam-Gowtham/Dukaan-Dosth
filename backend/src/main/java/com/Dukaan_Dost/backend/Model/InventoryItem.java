package com.Dukaan_Dost.backend.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    private String unit; // kg, litre, packet, piece, etc.

    @Builder.Default
    private Integer minStockLevel = 5; // Low stock threshold

    private Double price; // Selling price

    private Double costPrice; // Purchase price

    @Column(nullable = false)
    private Long userId;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
