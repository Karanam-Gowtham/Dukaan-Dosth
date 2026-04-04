package com.Dukaan_Dost.backend.Controlller;

import com.Dukaan_Dost.backend.DTOs.ApiResponse;
import com.Dukaan_Dost.backend.DTOs.LedgerEntryDTO;
import com.Dukaan_Dost.backend.Service.LedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ledger")
@RequiredArgsConstructor
public class LedgerController {

    private final LedgerService ledgerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LedgerEntryDTO>>> getLedger(
            @RequestParam(defaultValue = "500") int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 2000);
        return ResponseEntity.ok(ApiResponse.success(ledgerService.getLedger(safeLimit)));
    }
}
