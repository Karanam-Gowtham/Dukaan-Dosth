package com.Dukaan_Dost.backend.Controlller;

import com.Dukaan_Dost.backend.DTOs.ApiResponse;
import com.Dukaan_Dost.backend.DTOs.UdhaarPaymentDTO;
import com.Dukaan_Dost.backend.DTOs.UdhaarRequestDTO;
import com.Dukaan_Dost.backend.DTOs.UdhaarResponseDTO;
import com.Dukaan_Dost.backend.Service.UdhaarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/udhaar")
@RequiredArgsConstructor
public class UdhaarController {

    private final UdhaarService udhaarService;

    // ✅ Add udhaar entry
    @PostMapping
    public ResponseEntity<ApiResponse<UdhaarResponseDTO>> addUdhaar(@Valid @RequestBody UdhaarRequestDTO dto) {
        UdhaarResponseDTO udhaar = udhaarService.addUdhaar(dto);
        return ResponseEntity.ok(ApiResponse.success("Udhaar entry added successfully", udhaar));
    }

    // ✅ Get all pending udhaar
    @GetMapping
    public ResponseEntity<ApiResponse<List<UdhaarResponseDTO>>> getPendingUdhaar() {
        return ResponseEntity.ok(ApiResponse.success(udhaarService.getPendingUdhaar()));
    }

    // ✅ Get all udhaar (including paid)
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<UdhaarResponseDTO>>> getAllUdhaar() {
        return ResponseEntity.ok(ApiResponse.success(udhaarService.getAllUdhaar()));
    }

    // ✅ Get udhaar by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UdhaarResponseDTO>> getUdhaarById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(udhaarService.getUdhaarById(id)));
    }

    // ✅ Record payment
    @PostMapping("/{id}/payment")
    public ResponseEntity<ApiResponse<UdhaarResponseDTO>> recordPayment(
            @PathVariable Long id,
            @Valid @RequestBody UdhaarPaymentDTO dto) {
        UdhaarResponseDTO udhaar = udhaarService.recordPayment(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Payment recorded successfully", udhaar));
    }

    // ✅ Mark as fully paid
    @PutMapping("/{id}/mark-paid")
    public ResponseEntity<ApiResponse<UdhaarResponseDTO>> markAsPaid(@PathVariable Long id) {
        UdhaarResponseDTO udhaar = udhaarService.markAsPaid(id);
        return ResponseEntity.ok(ApiResponse.success("Udhaar marked as paid", udhaar));
    }

    // ✅ Search by customer name
    @GetMapping("/customer/{name}")
    public ResponseEntity<ApiResponse<List<UdhaarResponseDTO>>> getByCustomer(@PathVariable String name) {
        return ResponseEntity.ok(ApiResponse.success(udhaarService.getByCustomerName(name)));
    }

    // ✅ Get total pending
    @GetMapping("/total-pending")
    public ResponseEntity<ApiResponse<Double>> getTotalPending() {
        return ResponseEntity.ok(ApiResponse.success("Total pending udhaar", udhaarService.getTotalPending()));
    }

    // ✅ Delete udhaar
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUdhaar(@PathVariable Long id) {
        udhaarService.deleteUdhaar(id);
        return ResponseEntity.ok(ApiResponse.success("Udhaar entry deleted successfully", null));
    }
}
