package com.Dukaan_Dost.backend.Service;

import com.Dukaan_Dost.backend.Model.Transaction;
import com.Dukaan_Dost.backend.Model.User;
import com.Dukaan_Dost.backend.Repos.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public Transaction createTransaction(Transaction transaction, User user) {
        transaction.setUser(user);
        if (transaction.getCreatedAt() == null) {
            transaction.setCreatedAt(LocalDateTime.now());
        }
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactionsByUser(User user) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public List<Transaction> getTodayTransactions(User user) {
        LocalDateTime start = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime end = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        return transactionRepository.findByUserIdAndCreatedAtBetween(user.getId(), start, end);
    }

    public List<Transaction> getTransactionsByDate(User user, LocalDate date) {
        LocalDateTime start = LocalDateTime.of(date, LocalTime.MIN);
        LocalDateTime end = LocalDateTime.of(date, LocalTime.MAX);
        return transactionRepository.findByUserIdAndCreatedAtBetween(user.getId(), start, end);
    }

    public BigDecimal getTodayTotalByType(User user, Transaction.TransactionType type) {
        LocalDateTime start = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime end = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        BigDecimal total = transactionRepository.sumAmountByUserIdAndTypeAndDate(user.getId(), type, start, end);
        return total != null ? total : BigDecimal.ZERO;
    }

    public List<Transaction> getUdhaarSummary(User user) {
        return transactionRepository.findUdhaarByUserId(user.getId());
    }

    public void deleteTransaction(UUID id) {
        transactionRepository.deleteById(id);
    }

    public Transaction updateTransaction(UUID id, Transaction updatedTx) {
        return transactionRepository.findById(id).map(tx -> {
            tx.setAmount(updatedTx.getAmount());
            tx.setDescription(updatedTx.getDescription());
            tx.setType(updatedTx.getType());
            tx.setCategory(updatedTx.getCategory());
            tx.setCustomerName(updatedTx.getCustomerName());
            return transactionRepository.save(tx);
        }).orElseThrow(() -> new RuntimeException("Transaction not found"));
    }
}
