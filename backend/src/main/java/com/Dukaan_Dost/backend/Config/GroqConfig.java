package com.Dukaan_Dost.backend.Config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "groq.api")
@Getter
@Setter
public class GroqConfig {
    private String key;
    private String url;
    private String model;
}
