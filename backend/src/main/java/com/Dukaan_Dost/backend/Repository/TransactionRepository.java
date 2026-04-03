package com.Dukaan_Dost.backend.Repository;

import com.Dukaan_Dost.backend.Model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.createdAt >= :start AND t.createdAt <= :end")
    List<Transaction> findByUserIdAndCreatedAtBetween(
            @Param("userId") Long userId, 
            @Param("start") LocalDateTime start, 
            @Param("end") LocalDateTime end
    );

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.createdAt >= :start AND t.createdAt <= :end")
    BigDecimal sumAmountByUserIdAndTypeAndDate(
            @Param("userId") Long userId, 
            @Param("type") Transaction.TransactionType type,
            @Param("start") LocalDateTime start, 
            @Param("end") LocalDateTime end
    );

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND (t.type = 'CREDIT_GIVEN' OR t.type = 'CREDIT_RECEIVED')")
    List<Transaction> findUdhaarByUserId(@Param("userId") Long userId);
}
