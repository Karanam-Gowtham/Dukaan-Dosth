package com.Dukaan_Dost.backend.Controlller;

import com.Dukaan_Dost.backend.Model.DailySummary;
import com.Dukaan_Dost.backend.Model.Transaction;
import com.Dukaan_Dost.backend.Model.User;
import com.Dukaan_Dost.backend.Repos.UserRepository;
import com.Dukaan_Dost.backend.Service.DailySummaryService;
import com.Dukaan_Dost.backend.Service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private DailySummaryService dailySummaryService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByPhone(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/today")
    public ResponseEntity<Map<String, Object>> getTodaySummary() {
        User user = getCurrentUser();
        Map<String, Object> summary = new HashMap<>();
        summary.put("todaySales", transactionService.getTodayTotalByType(user, Transaction.TransactionType.SALE));
        summary.put("todayExpenses", transactionService.getTodayTotalByType(user, Transaction.TransactionType.EXPENSE));
        summary.put("netProfit", ((java.math.BigDecimal)summary.get("todaySales")).subtract((java.math.BigDecimal)summary.get("todayExpenses")));
        summary.put("pendingUdhaar", transactionService.getTodayTotalByType(user, Transaction.TransactionType.CREDIT_GIVEN));
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<DailySummary>> getWeekly() {
        return ResponseEntity.ok(dailySummaryService.getWeeklySummaries(getCurrentUser()));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Transaction>> getRecent(@RequestParam(defaultValue = "5") int limit) {
        // Simple case: get all then limit for now
        List<Transaction> all = transactionService.getTransactionsByUser(getCurrentUser());
        return ResponseEntity.ok(all.stream().limit(limit).toList());
    }

    @GetMapping("/udhaar")
    public ResponseEntity<List<Transaction>> getUdhaar() {
        return ResponseEntity.ok(transactionService.getUdhaarSummary(getCurrentUser()));
    }
}
