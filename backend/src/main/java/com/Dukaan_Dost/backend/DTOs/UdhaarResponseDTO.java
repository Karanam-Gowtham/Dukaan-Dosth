package com.Dukaan_Dost.backend.DTOs;

import com.Dukaan_Dost.backend.Model.UdhaarStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UdhaarResponseDTO {

    private Long id;
    private String customerName;
    private String customerPhone;
    private Double totalAmount;
    private Double pendingAmount;
    private Double paidAmount;
    private UdhaarStatus status;
    private String description;
    private LocalDate date;
    private List<PaymentHistoryDTO> payments;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentHistoryDTO {
        private Long id;
        private Double amount;
        private LocalDate paymentDate;
        private String note;
        private LocalDateTime createdAt;
    }
}
