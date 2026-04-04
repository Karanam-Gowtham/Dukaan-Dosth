package com.Dukaan_Dost.backend.Service;

import com.Dukaan_Dost.backend.DTOs.UdhaarPaymentDTO;
import com.Dukaan_Dost.backend.DTOs.UdhaarRequestDTO;
import com.Dukaan_Dost.backend.DTOs.UdhaarResponseDTO;
import com.Dukaan_Dost.backend.Exception.ResourceNotFoundException;
import com.Dukaan_Dost.backend.Model.UdhaarEntry;
import com.Dukaan_Dost.backend.Model.UdhaarPayment;
import com.Dukaan_Dost.backend.Model.UdhaarStatus;
import com.Dukaan_Dost.backend.Repos.UdhaarRepository;
import com.Dukaan_Dost.backend.Util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UdhaarService {

    private final UdhaarRepository udhaarRepository;
    private final AuthUtil authUtil;

    // ✅ Add udhaar entry
    @Transactional
    public UdhaarResponseDTO addUdhaar(UdhaarRequestDTO dto) {
        Long userId = authUtil.getCurrentUserId();

        UdhaarEntry entry = UdhaarEntry.builder()
                .customerName(dto.getCustomerName())
                .customerPhone(dto.getCustomerPhone())
                .totalAmount(dto.getTotalAmount())
                .pendingAmount(dto.getTotalAmount())
                .status(UdhaarStatus.PENDING)
                .description(dto.getDescription())
                .date(LocalDate.now())
                .userId(userId)
                .payments(new ArrayList<>())
                .build();

        UdhaarEntry saved = udhaarRepository.save(entry);
        return toResponseDTO(saved);
    }

    // ✅ Get all udhaar entries
    public List<UdhaarResponseDTO> getAllUdhaar() {
        Long userId = authUtil.getCurrentUserId();
        return udhaarRepository.findByUserId(userId)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    // ✅ Get pending udhaar
    public List<UdhaarResponseDTO> getPendingUdhaar() {
        Long userId = authUtil.getCurrentUserId();
        List<UdhaarResponseDTO> pending = udhaarRepository.findByUserIdAndStatus(userId, UdhaarStatus.PENDING)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
        List<UdhaarResponseDTO> partial = udhaarRepository.findByUserIdAndStatus(userId, UdhaarStatus.PARTIAL)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
        pending.addAll(partial);
        return pending;
    }

    // ✅ Get udhaar by ID
    public UdhaarResponseDTO getUdhaarById(Long id) {
        Long userId = authUtil.getCurrentUserId();
        UdhaarEntry entry = udhaarRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Udhaar entry not found with id: " + id));
        if (!entry.getUserId().equals(userId)) {
            throw new RuntimeException("You can only view your own udhaar entries");
        }
        return toResponseDTO(entry);
    }

    // ✅ Record payment
    @Transactional
    public UdhaarResponseDTO recordPayment(Long id, UdhaarPaymentDTO dto) {
        Long userId = authUtil.getCurrentUserId();

        UdhaarEntry entry = udhaarRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Udhaar entry not found with id: " + id));
        if (!entry.getUserId().equals(userId)) {
            throw new RuntimeException("You can only manage your own udhaar entries");
        }

        if (entry.getStatus() == UdhaarStatus.PAID) {
            throw new IllegalArgumentException("This udhaar is already fully paid");
        }

        if (dto.getAmount() > entry.getPendingAmount()) {
            throw new IllegalArgumentException("Payment amount (₹" + dto.getAmount()
                    + ") exceeds pending amount (₹" + entry.getPendingAmount() + ")");
        }

        // Create payment record
        UdhaarPayment payment = UdhaarPayment.builder()
                .amount(dto.getAmount())
                .paymentDate(LocalDate.now())
                .note(dto.getNote())
                .udhaarEntry(entry)
                .build();

        entry.getPayments().add(payment);

        // Update pending amount
        double newPending = entry.getPendingAmount() - dto.getAmount();
        entry.setPendingAmount(newPending);

        // Update status
        if (newPending <= 0) {
            entry.setStatus(UdhaarStatus.PAID);
            entry.setPendingAmount(0.0);
        } else {
            entry.setStatus(UdhaarStatus.PARTIAL);
        }

        UdhaarEntry saved = udhaarRepository.save(entry);
        return toResponseDTO(saved);
    }

    // ✅ Mark as fully paid
    @Transactional
    public UdhaarResponseDTO markAsPaid(Long id) {
        Long userId = authUtil.getCurrentUserId();

        UdhaarEntry entry = udhaarRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Udhaar entry not found with id: " + id));
        if (!entry.getUserId().equals(userId)) {
            throw new RuntimeException("You can only manage your own udhaar entries");
        }

        // Record remaining as final payment
        if (entry.getPendingAmount() > 0) {
            UdhaarPayment payment = UdhaarPayment.builder()
                    .amount(entry.getPendingAmount())
                    .paymentDate(LocalDate.now())
                    .note("Marked as fully paid")
                    .udhaarEntry(entry)
                    .build();
            entry.getPayments().add(payment);
        }

        entry.setPendingAmount(0.0);
        entry.setStatus(UdhaarStatus.PAID);

        UdhaarEntry saved = udhaarRepository.save(entry);
        return toResponseDTO(saved);
    }

    // ✅ Search by customer name
    public List<UdhaarResponseDTO> getByCustomerName(String customerName) {
        Long userId = authUtil.getCurrentUserId();
        return udhaarRepository.findByUserIdAndCustomerNameContainingIgnoreCase(userId, customerName)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    // ✅ Get total pending amount
    public Double getTotalPending() {
        Long userId = authUtil.getCurrentUserId();
        return udhaarRepository.sumPendingAmountByUserId(userId);
    }

    // ✅ Delete udhaar
    @Transactional
    public void deleteUdhaar(Long id) {
        Long userId = authUtil.getCurrentUserId();
        UdhaarEntry entry = udhaarRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Udhaar entry not found with id: " + id));
        if (!entry.getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own udhaar entries");
        }
        udhaarRepository.delete(entry);
    }

    private UdhaarResponseDTO toResponseDTO(UdhaarEntry entry) {
        List<UdhaarResponseDTO.PaymentHistoryDTO> paymentDTOs = entry.getPayments() != null ?
                entry.getPayments().stream().map(p -> UdhaarResponseDTO.PaymentHistoryDTO.builder()
                        .id(p.getId())
                        .amount(p.getAmount())
                        .paymentDate(p.getPaymentDate())
                        .note(p.getNote())
                        .createdAt(p.getCreatedAt())
                        .build()
                ).collect(Collectors.toList()) : new ArrayList<>();

        return UdhaarResponseDTO.builder()
                .id(entry.getId())
                .customerName(entry.getCustomerName())
                .customerPhone(entry.getCustomerPhone())
                .totalAmount(entry.getTotalAmount())
                .pendingAmount(entry.getPendingAmount())
                .paidAmount(entry.getTotalAmount() - entry.getPendingAmount())
                .status(entry.getStatus())
                .description(entry.getDescription())
                .date(entry.getDate())
                .payments(paymentDTOs)
                .createdAt(entry.getCreatedAt())
                .build();
    }
}
