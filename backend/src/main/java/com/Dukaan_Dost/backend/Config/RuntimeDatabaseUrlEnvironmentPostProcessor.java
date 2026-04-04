package com.Dukaan_Dost.backend.Config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Render / Heroku expose {@code DATABASE_URL} as {@code postgresql://user:pass@host/db}.
 * Spring Boot expects {@code jdbc:postgresql://host:5432/db}. This runs before DataSource auto-config.
 */
public class RuntimeDatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROP_URL = "spring.datasource.url";
    private static final String PROP_USER = "spring.datasource.username";
    private static final String PROP_PASS = "spring.datasource.password";
    private static final String PROP_DRIVER = "spring.datasource.driver-class-name";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        try {
            Map<String, Object> converted = tryConvert(environment);
            if (converted != null && !converted.isEmpty()) {
                environment.getPropertySources().addFirst(
                        new MapPropertySource("runtimePostgresUrl", converted));
            }
        } catch (URISyntaxException e) {
            throw new IllegalStateException("Invalid DATABASE_URL / postgres connection string: " + e.getMessage(), e);
        }
    }

    private static Map<String, Object> tryConvert(ConfigurableEnvironment env) throws URISyntaxException {
        // Prefer raw env (Render/Heroku) — avoids placeholder resolution ordering issues
        String databaseUrl = firstNonBlank(System.getenv("DATABASE_URL"), env.getProperty("DATABASE_URL"));
        String springRaw = firstNonBlank(System.getenv("SPRING_DATASOURCE_URL"), env.getProperty("SPRING_DATASOURCE_URL"));
        String resolvedUrl = env.getProperty(PROP_URL);

        if (databaseUrl != null && isLibpqStyle(databaseUrl)) {
            return toSpringProps(databaseUrl.trim());
        }
        if (springRaw != null && isLibpqStyle(springRaw)) {
            return toSpringProps(springRaw.trim());
        }
        if (resolvedUrl != null && isLibpqStyle(resolvedUrl)) {
            return toSpringProps(resolvedUrl.trim());
        }
        return null;
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) {
            return a;
        }
        if (b != null && !b.isBlank()) {
            return b;
        }
        return null;
    }

    private static boolean isLibpqStyle(String url) {
        String u = url.trim();
        return u.startsWith("postgres://") || u.startsWith("postgresql://");
    }

    private static Map<String, Object> toSpringProps(String raw) throws URISyntaxException {
        URI parsed = parseAsHttpUri(raw);
        String host = parsed.getHost();
        if (host == null || host.isBlank()) {
            throw new URISyntaxException(raw, "missing host");
        }
        int port = parsed.getPort();
        if (port < 0) {
            port = 5432;
        }
        String path = parsed.getPath();
        if (path == null || path.isBlank() || "/".equals(path)) {
            throw new URISyntaxException(raw, "missing database name in path");
        }
        String db = path.startsWith("/") ? path.substring(1) : path;
        String query = parsed.getRawQuery();

        StringBuilder jdbc = new StringBuilder();
        jdbc.append("jdbc:postgresql://").append(host).append(":").append(port).append("/").append(db);
        if (query != null && !query.isEmpty()) {
            jdbc.append("?").append(query);
        }

        String userInfo = parsed.getUserInfo();
        String user = "postgres";
        String pass = "";
        if (userInfo != null && !userInfo.isEmpty()) {
            int colon = userInfo.indexOf(':');
            if (colon >= 0) {
                user = decode(userInfo.substring(0, colon));
                pass = decode(userInfo.substring(colon + 1));
            } else {
                user = decode(userInfo);
            }
        }

        Map<String, Object> map = new HashMap<>();
        map.put(PROP_URL, jdbc.toString());
        map.put(PROP_USER, user);
        map.put(PROP_PASS, pass);
        map.put(PROP_DRIVER, "org.postgresql.Driver");
        return map;
    }

    private static URI parseAsHttpUri(String raw) throws URISyntaxException {
        String s = raw.trim();
        if (s.startsWith("postgres://")) {
            s = "http://" + s.substring("postgres://".length());
        } else if (s.startsWith("postgresql://")) {
            s = "http://" + s.substring("postgresql://".length());
        } else {
            throw new URISyntaxException(raw, "expected postgres:// or postgresql://");
        }
        return new URI(s);
    }

    private static String decode(String s) {
        return URLDecoder.decode(s, StandardCharsets.UTF_8);
    }
}
