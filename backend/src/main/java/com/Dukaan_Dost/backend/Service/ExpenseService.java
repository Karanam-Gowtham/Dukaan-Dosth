package com.Dukaan_Dost.backend.Service;

import com.Dukaan_Dost.backend.DTOs.ExpenseRequestDTO;
import com.Dukaan_Dost.backend.DTOs.ExpenseResponseDTO;
import com.Dukaan_Dost.backend.Exception.ResourceNotFoundException;
import com.Dukaan_Dost.backend.Model.Expense;
import com.Dukaan_Dost.backend.Model.ExpenseCategory;
import com.Dukaan_Dost.backend.Repos.ExpenseRepository;
import com.Dukaan_Dost.backend.Util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final AuthUtil authUtil;

    @Transactional
    public ExpenseResponseDTO addExpense(ExpenseRequestDTO dto) {
        Long userId = authUtil.getCurrentUserId();

        Expense expense = Expense.builder()
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .category(dto.getCategory() != null ? dto.getCategory() : ExpenseCategory.OTHER)
                .date(LocalDate.now())
                .userId(userId)
                .build();

        Expense saved = expenseRepository.save(expense);
        return toResponseDTO(saved);
    }

    public List<ExpenseResponseDTO> getTodayExpenses() {
        Long userId = authUtil.getCurrentUserId();
        return expenseRepository.findByUserIdAndDate(userId, LocalDate.now())
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public Double getTodayTotal() {
        Long userId = authUtil.getCurrentUserId();
        return expenseRepository.sumAmountByUserIdAndDate(userId, LocalDate.now());
    }

    public List<ExpenseResponseDTO> getExpensesByDate(LocalDate date) {
        Long userId = authUtil.getCurrentUserId();
        return expenseRepository.findByUserIdAndDate(userId, date)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public Double getTotalByDate(LocalDate date) {
        Long userId = authUtil.getCurrentUserId();
        return expenseRepository.sumAmountByUserIdAndDate(userId, date);
    }

    @Transactional
    public void deleteExpense(Long id) {
        Long userId = authUtil.getCurrentUserId();
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        if (!expense.getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own expenses");
        }
        expenseRepository.delete(expense);
    }

    private ExpenseResponseDTO toResponseDTO(Expense expense) {
        return ExpenseResponseDTO.builder()
                .id(expense.getId())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .category(expense.getCategory())
                .date(expense.getDate())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
