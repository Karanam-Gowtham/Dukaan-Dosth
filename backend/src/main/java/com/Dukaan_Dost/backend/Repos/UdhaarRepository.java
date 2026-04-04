package com.Dukaan_Dost.backend.Repos;

import com.Dukaan_Dost.backend.Model.UdhaarEntry;
import com.Dukaan_Dost.backend.Model.UdhaarStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UdhaarRepository extends JpaRepository<UdhaarEntry, Long> {

    List<UdhaarEntry> findByUserIdAndStatus(Long userId, UdhaarStatus status);

    List<UdhaarEntry> findByUserId(Long userId);

    List<UdhaarEntry> findByUserIdAndCustomerNameContainingIgnoreCase(Long userId, String customerName);

    @Query("SELECT COALESCE(SUM(u.pendingAmount), 0) FROM UdhaarEntry u WHERE u.userId = :userId AND u.status != 'PAID'")
    Double sumPendingAmountByUserId(@Param("userId") Long userId);
}
