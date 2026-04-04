package com.Dukaan_Dost.backend.Repos;

import com.Dukaan_Dost.backend.Model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findByUserIdAndDate(Long userId, LocalDate date);

    List<Sale> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(s.amount), 0) FROM Sale s WHERE s.userId = :userId AND s.date = :date")
    Double sumAmountByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(s.amount), 0) FROM Sale s WHERE s.userId = :userId AND s.date BETWEEN :startDate AND :endDate")
    Double sumAmountByUserIdAndDateBetween(@Param("userId") Long userId,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);
}
