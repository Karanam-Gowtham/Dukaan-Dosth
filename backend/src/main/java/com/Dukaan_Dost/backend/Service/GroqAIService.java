package com.Dukaan_Dost.backend.Service;

import com.Dukaan_Dost.backend.Config.GroqConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroqAIService {

    private final WebClient webClient;
    private final GroqConfig groqConfig;

    /**
     * Generate AI summary text based on daily business data
     */
    @SuppressWarnings("unchecked")
    public String generateSummary(Double totalSales, Double totalExpenses, Double profit,
                                   String language, Double previousDaySales, Double previousDayExpenses) {

        String prompt = buildPrompt(totalSales, totalExpenses, profit, language,
                previousDaySales, previousDayExpenses);

        try {
            Map<String, Object> requestBody = Map.of(
                    "model", groqConfig.getModel(),
                    "messages", List.of(
                            Map.of("role", "system", "content", getSystemPrompt(language)),
                            Map.of("role", "user", "content", prompt)
                    ),
                    "temperature", 0.7,
                    "max_tokens", 300
            );

            Map<String, Object> response = webClient.post()
                    .uri(groqConfig.getUrl())
                    .header("Authorization", "Bearer " + groqConfig.getKey())
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }

            return getFallbackSummary(totalSales, totalExpenses, profit, language);

        } catch (Exception e) {
            log.error("Error calling Groq API: {}", e.getMessage());
            return getFallbackSummary(totalSales, totalExpenses, profit, language);
        }
    }

    private String getSystemPrompt(String language) {
        if ("te".equals(language)) {
            return "You are a helpful business assistant for a small kirana (grocery) store in India. " +
                    "You must respond in Telugu language. Keep your response simple, short and helpful. " +
                    "Format your response as:\n" +
                    "SUMMARY: (2-3 lines summary with numbers)\n" +
                    "INSIGHT: (1 line observation)\n" +
                    "SUGGESTION: (1 line actionable advice)";
        }
        return "You are a helpful business assistant for a small kirana (grocery) store in India. " +
                "Keep your response simple, short and helpful. The shop owner may have limited English. " +
                "Format your response as:\n" +
                "SUMMARY: (2-3 lines summary with numbers)\n" +
                "INSIGHT: (1 line observation)\n" +
                "SUGGESTION: (1 line actionable advice)";
    }

    private String buildPrompt(Double totalSales, Double totalExpenses, Double profit,
                                String language, Double previousDaySales, Double previousDayExpenses) {

        StringBuilder prompt = new StringBuilder();
        prompt.append("Today's business data for my kirana store:\n");
        prompt.append("- Total Sales: ₹").append(String.format("%.2f", totalSales)).append("\n");
        prompt.append("- Total Expenses: ₹").append(String.format("%.2f", totalExpenses)).append("\n");
        prompt.append("- Profit: ₹").append(String.format("%.2f", profit)).append("\n");

        if (previousDaySales != null && previousDaySales > 0) {
            prompt.append("- Yesterday's Sales: ₹").append(String.format("%.2f", previousDaySales)).append("\n");
            prompt.append("- Yesterday's Expenses: ₹").append(String.format("%.2f", previousDayExpenses)).append("\n");
        }

        prompt.append("\nPlease give me a summary, insight, and suggestion.");

        if ("te".equals(language)) {
            prompt.append(" Respond in Telugu.");
        }

        return prompt.toString();
    }

    /**
     * Fallback summary when AI is unavailable
     */
    private String getFallbackSummary(Double totalSales, Double totalExpenses, Double profit, String language) {
        if ("te".equals(language)) {
            return String.format(
                    "SUMMARY: ఈ రోజు మీ అమ్మకాలు ₹%.2f, ఖర్చులు ₹%.2f. మీ లాభం ₹%.2f.\n" +
                            "INSIGHT: %s\n" +
                            "SUGGESTION: మీ ఖర్చులను తగ్గించడానికి ప్రయత్నించండి.",
                    totalSales, totalExpenses, profit,
                    profit >= 0 ? "మీ వ్యాపారం లాభదాయకంగా ఉంది." : "ఈ రోజు నష్టం వచ్చింది."
            );
        }
        return String.format(
                "SUMMARY: Today your sales were ₹%.2f and expenses were ₹%.2f. You made a %s of ₹%.2f.\n" +
                        "INSIGHT: %s\n" +
                        "SUGGESTION: Try to track your expenses carefully to maximize profit.",
                totalSales, totalExpenses,
                profit >= 0 ? "profit" : "loss",
                Math.abs(profit),
                profit >= 0 ? "Your business is profitable today." : "Today you had a loss. Review your expenses."
        );
    }

    /**
     * Process a conversational voice query using Groq
     */
    @SuppressWarnings("unchecked")
    public String processConversationalQuery(String query, String language, com.Dukaan_Dost.backend.DTOs.DailySummaryDTO stats) {
        StringBuilder systemContent = new StringBuilder();
        if ("te".equals(language)) {
            systemContent.append("You are 'Dukaan Dost', a smart voice assistant for a Kirana store owner in India. Respond strictly in clear Telugu.\n");
        } else {
            systemContent.append("You are 'Dukaan Dost', a smart voice assistant for a Kirana store owner in India. Respond strictly in clear English.\n");
        }
        
        systemContent.append("Here is the live store data to help you answer:\n")
                     .append("- Today's Sales: ₹").append(stats.getTotalSales()).append("\n")
                     .append("- Today's Expenses: ₹").append(stats.getTotalExpenses()).append("\n")
                     .append("- Today's Profit: ₹").append(stats.getProfit()).append("\n")
                     .append("- Pending Udhaar: ₹").append(stats.getPendingUdhaar()).append("\n")
                     .append("- Low Stock Items: ").append(stats.getLowStockItemsCount()).append("\n\n")
                     .append("Keep your answer extremely concise, like a voice assistant (1-3 sentences maximum).");

        try {
            Map<String, Object> requestBody = Map.of(
                    "model", groqConfig.getModel(),
                    "messages", List.of(
                            Map.of("role", "system", "content", systemContent.toString()),
                            Map.of("role", "user", "content", query)
                    ),
                    "temperature", 0.7,
                    "max_tokens", 150
            );

            Map<String, Object> response = webClient.post()
                    .uri(groqConfig.getUrl())
                    .header("Authorization", "Bearer " + groqConfig.getKey())
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
            return "I'm sorry, I couldn't reach the AI server right now.";
        } catch (Exception e) {
            log.error("Error in conversational AI: {}", e.getMessage());
            if ("te".equals(language)) {
                return "క్షమించండి, నా వల్ల ఇప్పుడు సర్వర్ ను చేరుకోవడం సాధ్యం కావడం లేదు.";
            }
            return "I'm sorry, I'm having trouble connecting to the AI brain right now.";
        }
    }
}
