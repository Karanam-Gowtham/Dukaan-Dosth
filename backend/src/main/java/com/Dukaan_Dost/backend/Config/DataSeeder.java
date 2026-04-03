package com.Dukaan_Dost.backend.Config;

import com.Dukaan_Dost.backend.Model.Transaction;
import com.Dukaan_Dost.backend.Model.User;
import com.Dukaan_Dost.backend.Repos.TransactionRepository;
import com.Dukaan_Dost.backend.Repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            seedData();
        }
    }

    private void seedData() {
        // Create a demo user
        User demoUser = new User();
        demoUser.setPhone("9999999999");
        demoUser.setPassword(passwordEncoder.encode("password123"));
        demoUser.setName("Ramesh");
        demoUser.setShopName("Ramesh Kirana Store");
        demoUser.setLanguagePref("te");
        demoUser.setRole(com.Dukaan_Dost.backend.Model.ROLEs.USER);
        userRepository.save(demoUser);

        // Add today's transactions
        createTx(demoUser, "Rice Sale", new BigDecimal("500"), Transaction.TransactionType.SALE, "Groceries");
        createTx(demoUser, "Milk Sale", new BigDecimal("120"), Transaction.TransactionType.SALE, "Dairy");
        createTx(demoUser, "Electricity Bill", new BigDecimal("1500"), Transaction.TransactionType.EXPENSE, "Utilities");
        createTx(demoUser, "Suresh Udhaar", new BigDecimal("300"), Transaction.TransactionType.CREDIT_GIVEN, "Udhaar");
        createTx(demoUser, "General Sale", new BigDecimal("2500"), Transaction.TransactionType.SALE, "General");
        
        System.out.println("✅ Demo data seeded successfully!");
        System.out.println("Demo Login: 9999999999 / password123");
    }

    private void createTx(User user, String desc, BigDecimal amount, Transaction.TransactionType type, String category) {
        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setDescription(desc);
        tx.setAmount(amount);
        tx.setType(type);
        tx.setCategory(category);
        tx.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(tx);
    }
}
