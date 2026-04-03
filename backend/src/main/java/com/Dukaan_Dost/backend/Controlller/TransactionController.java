package com.Dukaan_Dost.backend.Controlller;

import com.Dukaan_Dost.backend.Model.Transaction;
import com.Dukaan_Dost.backend.Model.User;
import com.Dukaan_Dost.backend.Repos.UserRepository;
import com.Dukaan_Dost.backend.Service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByPhone(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<Transaction> create(@RequestBody Transaction transaction) {
        return ResponseEntity.ok(transactionService.createTransaction(transaction, getCurrentUser()));
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getByDate(@RequestParam(required = false) String date) {
        User user = getCurrentUser();
        if (date != null) {
            return ResponseEntity.ok(transactionService.getTransactionsByDate(user, LocalDate.parse(date)));
        }
        return ResponseEntity.ok(transactionService.getTransactionsByUser(user));
    }

    @GetMapping("/today")
    public ResponseEntity<List<Transaction>> getToday() {
        return ResponseEntity.ok(transactionService.getTodayTransactions(getCurrentUser()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> update(@PathVariable UUID id, @RequestBody Transaction transaction) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, transaction));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok().build();
    }
}
