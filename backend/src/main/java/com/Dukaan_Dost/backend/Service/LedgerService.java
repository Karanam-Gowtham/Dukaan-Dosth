package com.Dukaan_Dost.backend.Service;

import com.Dukaan_Dost.backend.DTOs.LedgerEntryDTO;
import com.Dukaan_Dost.backend.Model.Expense;
import com.Dukaan_Dost.backend.Model.Sale;
import com.Dukaan_Dost.backend.Model.UdhaarEntry;
import com.Dukaan_Dost.backend.Model.UdhaarPayment;
import com.Dukaan_Dost.backend.Repos.ExpenseRepository;
import com.Dukaan_Dost.backend.Repos.SaleRepository;
import com.Dukaan_Dost.backend.Repos.UdhaarRepository;
import com.Dukaan_Dost.backend.Util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LedgerService {

    private final SaleRepository saleRepository;
    private final ExpenseRepository expenseRepository;
    private final UdhaarRepository udhaarRepository;
    private final AuthUtil authUtil;

    public List<LedgerEntryDTO> getLedger(int limit) {
        Long userId = authUtil.getCurrentUserId();
        List<LedgerEntryDTO> entries = new ArrayList<>();

        for (Sale s : saleRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            entries.add(LedgerEntryDTO.builder()
                    .id("sale-" + s.getId())
                    .type("SALE")
                    .amount(s.getAmount())
                    .description(s.getDescription() != null ? s.getDescription() : "Sale")
                    .category("SALE")
                    .customerName(null)
                    .createdAt(s.getCreatedAt() != null ? s.getCreatedAt().toString() : "")
                    .build());
        }

        for (Expense e : expenseRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            String cat = e.getCategory() != null ? e.getCategory().name() : "OTHER";
            entries.add(LedgerEntryDTO.builder()
                    .id("expense-" + e.getId())
                    .type("EXPENSE")
                    .amount(e.getAmount())
                    .description(e.getDescription() != null ? e.getDescription() : "Expense")
                    .category(cat)
                    .customerName(null)
                    .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : "")
                    .build());
        }

        for (UdhaarEntry u : udhaarRepository.findByUserId(userId)) {
            String desc = u.getDescription() != null ? u.getDescription() : "Udhaar given";
            entries.add(LedgerEntryDTO.builder()
                    .id("udhaar-" + u.getId())
                    .type("CREDIT_GIVEN")
                    .amount(u.getTotalAmount())
                    .description(desc)
                    .category("UDHAAR")
                    .customerName(u.getCustomerName())
                    .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : "")
                    .build());

            List<UdhaarPayment> payments = u.getPayments() != null ? u.getPayments() : List.of();
            for (UdhaarPayment p : payments) {
                entries.add(LedgerEntryDTO.builder()
                        .id("udhaar-" + u.getId() + "-pay-" + p.getId())
                        .type("CREDIT_RECEIVED")
                        .amount(p.getAmount())
                        .description(p.getNote() != null && !p.getNote().isBlank()
                                ? p.getNote()
                                : "Udhaar payment received")
                        .category("UDHAAR")
                        .customerName(u.getCustomerName())
                        .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : "")
                        .build());
            }
        }

        entries.sort(Comparator.comparing(LedgerEntryDTO::getCreatedAt).reversed());

        if (limit > 0 && entries.size() > limit) {
            return entries.subList(0, limit);
        }
        return entries;
    }
}
