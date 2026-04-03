package com.Dukaan_Dost.backend.Service;

import com.Dukaan_Dost.backend.Model.DailySummary;
import com.Dukaan_Dost.backend.Model.Transaction;
import com.Dukaan_Dost.backend.Model.User;
import com.Dukaan_Dost.backend.Repos.DailySummaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class DailySummaryService {

    @Autowired
    private DailySummaryRepository dailySummaryRepository;

    @Autowired
    private TransactionService transactionService;

    public DailySummary getSummaryForDate(User user, LocalDate date) {
        Optional<DailySummary> summary = dailySummaryRepository.findByUserIdAndSummaryDate(user.getId(), date);
        if (summary.isPresent()) {
            return summary.get();
        }
        
        // If no summary exists, create a dynamic one
        BigDecimal sales = transactionService.getTodayTotalByType(user, Transaction.TransactionType.SALE);
        BigDecimal expenses = transactionService.getTodayTotalByType(user, Transaction.TransactionType.EXPENSE);
        BigDecimal udhaarGiven = transactionService.getTodayTotalByType(user, Transaction.TransactionType.CREDIT_GIVEN);
        BigDecimal udhaarRecv = transactionService.getTodayTotalByType(user, Transaction.TransactionType.CREDIT_RECEIVED);
        
        return DailySummary.builder()
                .user(user)
                .summaryDate(date)
                .totalSales(sales)
                .totalExpenses(expenses)
                .netProfit(sales.subtract(expenses))
                .totalCreditGiven(udhaarGiven)
                .totalCreditReceived(udhaarRecv)
                .build();
    }

    public List<DailySummary> getWeeklySummaries(User user) {
        return dailySummaryRepository.findFirst7ByUserIdOrderBySummaryDateDesc(user.getId());
    }

    public DailySummary saveSummary(DailySummary summary) {
        return dailySummaryRepository.save(summary);
    }
}
