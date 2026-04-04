package com.Dukaan_Dost.backend.Controlller;

import com.Dukaan_Dost.backend.DTOs.AIQueryRequest;
import com.Dukaan_Dost.backend.DTOs.ApiResponse;
import com.Dukaan_Dost.backend.DTOs.DailySummaryDTO;
import com.Dukaan_Dost.backend.DTOs.ParseTransactionRequest;
import com.Dukaan_Dost.backend.DTOs.ParsedTransactionDTO;
import com.Dukaan_Dost.backend.Service.GroqAIService;
import com.Dukaan_Dost.backend.Service.SummaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIAssistantController {

    private final GroqAIService groqAIService;
    private final SummaryService summaryService;

    @PostMapping("/ask")
    public ResponseEntity<ApiResponse<String>> askVoiceAssistant(@RequestBody AIQueryRequest request) {
        String lang = (request.getLanguage() != null && request.getLanguage().startsWith("te")) ? "te" : "en";
        
        // Fetch real-time live data to feed into the voice assistant
        DailySummaryDTO stats = summaryService.getRawDailySummary(LocalDate.now());

        // Process query
        String answer = groqAIService.processConversationalQuery(request.getQuery(), lang, stats);

        return ResponseEntity.ok(ApiResponse.success("AI Replied", answer));
    }

    @PostMapping("/parse")
    public ResponseEntity<ApiResponse<ParsedTransactionDTO>> parseTransaction(@Valid @RequestBody ParseTransactionRequest request) {
        String lang = request.getLanguage() != null ? request.getLanguage() : "en";
        ParsedTransactionDTO parsed = groqAIService.parseTransactionText(request.getRawInput(), lang);
        return ResponseEntity.ok(ApiResponse.success("Parsed transaction", parsed));
    }
}
