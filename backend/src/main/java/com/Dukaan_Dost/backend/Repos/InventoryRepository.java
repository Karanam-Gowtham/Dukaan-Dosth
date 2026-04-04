package com.Dukaan_Dost.backend.Repos;

import com.Dukaan_Dost.backend.Model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {

    List<InventoryItem> findByUserId(Long userId);

    @Query("SELECT i FROM InventoryItem i WHERE i.userId = :userId AND i.quantity <= i.minStockLevel")
    List<InventoryItem> findLowStockItems(@Param("userId") Long userId);

    List<InventoryItem> findByUserIdAndNameContainingIgnoreCase(Long userId, String name);
}
