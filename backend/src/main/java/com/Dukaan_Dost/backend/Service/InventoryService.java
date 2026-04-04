package com.Dukaan_Dost.backend.Service;

import com.Dukaan_Dost.backend.DTOs.InventoryRequestDTO;
import com.Dukaan_Dost.backend.DTOs.InventoryResponseDTO;
import com.Dukaan_Dost.backend.DTOs.LowStockAlertDTO;
import com.Dukaan_Dost.backend.Exception.ResourceNotFoundException;
import com.Dukaan_Dost.backend.Model.InventoryItem;
import com.Dukaan_Dost.backend.Repos.InventoryRepository;
import com.Dukaan_Dost.backend.Util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final AuthUtil authUtil;

    // ✅ Add inventory item
    @Transactional
    public InventoryResponseDTO addItem(InventoryRequestDTO dto) {
        Long userId = authUtil.getCurrentUserId();

        InventoryItem item = InventoryItem.builder()
                .name(dto.getName())
                .quantity(dto.getQuantity() != null ? dto.getQuantity() : 0)
                .unit(dto.getUnit())
                .minStockLevel(dto.getMinStockLevel() != null ? dto.getMinStockLevel() : 5)
                .price(dto.getPrice())
                .costPrice(dto.getCostPrice())
                .userId(userId)
                .build();

        InventoryItem saved = inventoryRepository.save(item);
        return toResponseDTO(saved);
    }

    // ✅ Get all items
    public List<InventoryResponseDTO> getAllItems() {
        Long userId = authUtil.getCurrentUserId();
        return inventoryRepository.findByUserId(userId)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    // ✅ Update item
    @Transactional
    public InventoryResponseDTO updateItem(Long id, InventoryRequestDTO dto) {
        Long userId = authUtil.getCurrentUserId();

        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));
        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("You can only update your own inventory items");
        }

        if (dto.getName() != null) item.setName(dto.getName());
        if (dto.getQuantity() != null) item.setQuantity(dto.getQuantity());
        if (dto.getUnit() != null) item.setUnit(dto.getUnit());
        if (dto.getMinStockLevel() != null) item.setMinStockLevel(dto.getMinStockLevel());
        if (dto.getPrice() != null) item.setPrice(dto.getPrice());
        if (dto.getCostPrice() != null) item.setCostPrice(dto.getCostPrice());
        item.setUpdatedAt(LocalDateTime.now());

        InventoryItem saved = inventoryRepository.save(item);
        return toResponseDTO(saved);
    }

    // ✅ Update stock count only
    @Transactional
    public InventoryResponseDTO updateStockCount(Long id, Integer quantity) {
        Long userId = authUtil.getCurrentUserId();

        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));
        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("You can only update your own inventory items");
        }

        item.setQuantity(quantity);
        item.setUpdatedAt(LocalDateTime.now());

        InventoryItem saved = inventoryRepository.save(item);
        return toResponseDTO(saved);
    }

    // ✅ Get low stock alerts
    public LowStockAlertDTO getLowStockAlerts() {
        Long userId = authUtil.getCurrentUserId();
        List<InventoryResponseDTO> lowStockItems = inventoryRepository.findLowStockItems(userId)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());

        return LowStockAlertDTO.builder()
                .totalLowStockItems(lowStockItems.size())
                .items(lowStockItems)
                .build();
    }

    // ✅ Delete item
    @Transactional
    public void deleteItem(Long id) {
        Long userId = authUtil.getCurrentUserId();
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));
        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own inventory items");
        }
        inventoryRepository.delete(item);
    }

    private InventoryResponseDTO toResponseDTO(InventoryItem item) {
        return InventoryResponseDTO.builder()
                .id(item.getId())
                .name(item.getName())
                .quantity(item.getQuantity())
                .unit(item.getUnit())
                .minStockLevel(item.getMinStockLevel())
                .price(item.getPrice())
                .costPrice(item.getCostPrice())
                .lowStock(item.getQuantity() <= item.getMinStockLevel())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
