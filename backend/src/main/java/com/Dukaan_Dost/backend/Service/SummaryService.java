package com.Dukaan_Dost.backend.Service;

import com.Dukaan_Dost.backend.DTOs.AISummaryResponseDTO;
import com.Dukaan_Dost.backend.DTOs.DailySummaryDTO;
import com.Dukaan_Dost.backend.Model.User;
import com.Dukaan_Dost.backend.Repos.ExpenseRepository;
import com.Dukaan_Dost.backend.Repos.InventoryRepository;
import com.Dukaan_Dost.backend.Repos.SaleRepository;
import com.Dukaan_Dost.backend.Repos.UdhaarRepository;
import com.Dukaan_Dost.backend.Util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class SummaryService {

    private final SaleRepository saleRepository;
    private final ExpenseRepository expenseRepository;
    private final UdhaarRepository udhaarRepository;
    private final InventoryRepository inventoryRepository;
    private final GroqAIService groqAIService;
    private final AuthUtil authUtil;

    /**
     * Get daily summary with AI-generated text
     */
    public AISummaryResponseDTO getDailySummary(LocalDate date) {
        User user = authUtil.getCurrentUser();
        Long userId = user.getId();
        String language = user.getPreferredLanguage() != null ? user.getPreferredLanguage() : "en";

        // 1. Backend computes all numbers
        Double totalSales = saleRepository.sumAmountByUserIdAndDate(userId, date);
        Double totalExpenses = expenseRepository.sumAmountByUserIdAndDate(userId, date);
        Double profit = totalSales - totalExpenses;

        // 2. Get yesterday's data for comparison
        LocalDate yesterday = date.minusDays(1);
        Double previousDaySales = saleRepository.sumAmountByUserIdAndDate(userId, yesterday);
        Double previousDayExpenses = expenseRepository.sumAmountByUserIdAndDate(userId, yesterday);

        // 3. AI generates text only
        String aiResponse = groqAIService.generateSummary(
                totalSales, totalExpenses, profit,
                language, previousDaySales, previousDayExpenses
        );

        // 4. Parse AI response
        String summary = aiResponse;
        String insight = "";
        String suggestion = "";

        if (aiResponse.contains("SUMMARY:") && aiResponse.contains("INSIGHT:") && aiResponse.contains("SUGGESTION:")) {
            try {
                summary = aiResponse.substring(
                        aiResponse.indexOf("SUMMARY:") + 8,
                        aiResponse.indexOf("INSIGHT:")
                ).trim();
                insight = aiResponse.substring(
                        aiResponse.indexOf("INSIGHT:") + 8,
                        aiResponse.indexOf("SUGGESTION:")
                ).trim();
                suggestion = aiResponse.substring(
                        aiResponse.indexOf("SUGGESTION:") + 11
                ).trim();
            } catch (Exception e) {
                summary = aiResponse;
            }
        }

        return AISummaryResponseDTO.builder()
                .date(date)
                .totalSales(totalSales)
                .totalExpenses(totalExpenses)
                .profit(profit)
                .summary(summary)
                .insight(insight)
                .suggestion(suggestion)
                .language(language)
                .build();
    }

    /**
     * Get raw daily summary without AI
     */
    public DailySummaryDTO getRawDailySummary(LocalDate date) {
        User user = authUtil.getCurrentUser();
        Long userId = user.getId();

        Double totalSales = saleRepository.sumAmountByUserIdAndDate(userId, date);
        Double totalExpenses = expenseRepository.sumAmountByUserIdAndDate(userId, date);
        Double profit = totalSales - totalExpenses;
        int salesCount = saleRepository.findByUserIdAndDate(userId, date).size();
        int expensesCount = expenseRepository.findByUserIdAndDate(userId, date).size();
        Double pendingUdhaar = udhaarRepository.sumPendingAmountByUserId(userId);
        int lowStockCount = inventoryRepository.findLowStockItems(userId).size();

        return DailySummaryDTO.builder()
                .date(date)
                .totalSales(totalSales)
                .totalExpenses(totalExpenses)
                .profit(profit)
                .salesCount(salesCount)
                .expensesCount(expensesCount)
                .pendingUdhaar(pendingUdhaar)
                .lowStockItemsCount(lowStockCount)
                .build();
    }
}
