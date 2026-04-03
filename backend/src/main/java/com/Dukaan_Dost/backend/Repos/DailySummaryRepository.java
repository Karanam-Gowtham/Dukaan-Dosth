package com.Dukaan_Dost.backend.Repos;

import com.Dukaan_Dost.backend.Model.DailySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailySummaryRepository extends JpaRepository<DailySummary, UUID> {

    Optional<DailySummary> findByUserIdAndSummaryDate(Long userId, LocalDate summaryDate);

    List<DailySummary> findByUserIdOrderBySummaryDateDesc(Long userId);

    List<DailySummary> findFirst7ByUserIdOrderBySummaryDateDesc(Long userId);
}
