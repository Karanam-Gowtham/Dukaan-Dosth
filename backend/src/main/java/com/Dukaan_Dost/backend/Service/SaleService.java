package com.Dukaan_Dost.backend.Service;

import com.Dukaan_Dost.backend.DTOs.SaleItemDTO;
import com.Dukaan_Dost.backend.DTOs.SaleRequestDTO;
import com.Dukaan_Dost.backend.DTOs.SaleResponseDTO;
import com.Dukaan_Dost.backend.Exception.ResourceNotFoundException;
import com.Dukaan_Dost.backend.Model.Sale;
import com.Dukaan_Dost.backend.Model.SaleItem;
import com.Dukaan_Dost.backend.Repos.SaleRepository;
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
public class SaleService {

    private final SaleRepository saleRepository;
    private final AuthUtil authUtil;

    @Transactional
    public SaleResponseDTO addSale(SaleRequestDTO dto) {
        Long userId = authUtil.getCurrentUserId();

        Sale sale = Sale.builder()
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .date(LocalDate.now())
                .userId(userId)
                .items(new ArrayList<>())
                .build();

        // Add items if provided
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            for (SaleItemDTO itemDto : dto.getItems()) {
                SaleItem item = SaleItem.builder()
                        .itemName(itemDto.getItemName())
                        .price(itemDto.getPrice())
                        .quantity(itemDto.getQuantity() != null ? itemDto.getQuantity() : 1)
                        .sale(sale)
                        .build();
                sale.getItems().add(item);
            }
            // Auto-calculate total if items provided but amount not set
            if (dto.getAmount() == null || dto.getAmount() == 0) {
                double total = sale.getItems().stream()
                        .mapToDouble(i -> i.getPrice() * i.getQuantity())
                        .sum();
                sale.setAmount(total);
            }
        }

        Sale saved = saleRepository.save(sale);
        return toResponseDTO(saved);
    }

    public List<SaleResponseDTO> getTodaySales() {
        Long userId = authUtil.getCurrentUserId();
        return saleRepository.findByUserIdAndDate(userId, LocalDate.now())
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public Double getTodayTotal() {
        Long userId = authUtil.getCurrentUserId();
        return saleRepository.sumAmountByUserIdAndDate(userId, LocalDate.now());
    }

    public List<SaleResponseDTO> getSalesByDate(LocalDate date) {
        Long userId = authUtil.getCurrentUserId();
        return saleRepository.findByUserIdAndDate(userId, date)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public Double getTotalByDate(LocalDate date) {
        Long userId = authUtil.getCurrentUserId();
        return saleRepository.sumAmountByUserIdAndDate(userId, date);
    }

    public List<SaleResponseDTO> getSalesByDateRange(LocalDate startDate, LocalDate endDate) {
        Long userId = authUtil.getCurrentUserId();
        return saleRepository.findByUserIdAndDateBetween(userId, startDate, endDate)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional
    public void deleteSale(Long id) {
        Long userId = authUtil.getCurrentUserId();
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
        if (!sale.getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own sales");
        }
        saleRepository.delete(sale);
    }

    private SaleResponseDTO toResponseDTO(Sale sale) {
        List<SaleItemDTO> itemDTOs = sale.getItems() != null ?
                sale.getItems().stream().map(item -> SaleItemDTO.builder()
                        .itemName(item.getItemName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .build()
                ).collect(Collectors.toList()) : new ArrayList<>();

        return SaleResponseDTO.builder()
                .id(sale.getId())
                .amount(sale.getAmount())
                .description(sale.getDescription())
                .date(sale.getDate())
                .items(itemDTOs)
                .createdAt(sale.getCreatedAt())
                .build();
    }
}