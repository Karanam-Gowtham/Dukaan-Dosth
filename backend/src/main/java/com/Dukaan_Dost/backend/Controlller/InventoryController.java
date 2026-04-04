package com.Dukaan_Dost.backend.Controlller;

import com.Dukaan_Dost.backend.DTOs.ApiResponse;
import com.Dukaan_Dost.backend.DTOs.InventoryRequestDTO;
import com.Dukaan_Dost.backend.DTOs.InventoryResponseDTO;
import com.Dukaan_Dost.backend.DTOs.LowStockAlertDTO;
import com.Dukaan_Dost.backend.Service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // ✅ Add item
    @PostMapping
    public ResponseEntity<ApiResponse<InventoryResponseDTO>> addItem(@Valid @RequestBody InventoryRequestDTO dto) {
        InventoryResponseDTO item = inventoryService.addItem(dto);
        return ResponseEntity.ok(ApiResponse.success("Item added to inventory", item));
    }

    // ✅ Get all items
    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryResponseDTO>>> getAllItems() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getAllItems()));
    }

    // ✅ Update item
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryResponseDTO>> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody InventoryRequestDTO dto) {
        InventoryResponseDTO item = inventoryService.updateItem(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Item updated successfully", item));
    }

    // ✅ Update stock count only
    @PutMapping("/{id}/stock")
    public ResponseEntity<ApiResponse<InventoryResponseDTO>> updateStockCount(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        Integer quantity = body.get("quantity");
        if (quantity == null) {
            throw new IllegalArgumentException("Quantity is required");
        }
        InventoryResponseDTO item = inventoryService.updateStockCount(id, quantity);
        return ResponseEntity.ok(ApiResponse.success("Stock count updated", item));
    }

    // ✅ Get low stock alerts
    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<LowStockAlertDTO>> getLowStockAlerts() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getLowStockAlerts()));
    }

    // ✅ Delete item
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable Long id) {
        inventoryService.deleteItem(id);
        return ResponseEntity.ok(ApiResponse.success("Item deleted from inventory", null));
    }
}
