package com.Dukaan_Dost.backend.Config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/**
 * Render sets {@code DATABASE_URL} as {@code postgresql://user:pass@host/db}.
 * JDBC requires {@code jdbc:postgresql://...}. A plain {@code @Bean} runs reliably; EnvironmentPostProcessor can be skipped on some deploys.
 */
@Configuration
public class RenderAwareDataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) throws URISyntaxException {
        String libpq = firstLibpqUrl(properties);
        if (libpq != null) {
            Parsed p = parseLibpq(libpq.trim());
            HikariDataSource ds = new HikariDataSource();
            ds.setJdbcUrl(p.jdbcUrl());
            ds.setUsername(p.username());
            ds.setPassword(p.password());
            ds.setDriverClassName("org.postgresql.Driver");
            return ds;
        }
        return properties.initializeDataSourceBuilder().type(HikariDataSource.class).build();
    }

    private static String firstLibpqUrl(DataSourceProperties properties) {
        String a = System.getenv("DATABASE_URL");
        if (isLibpq(a)) {
            return a;
        }
        String b = System.getenv("SPRING_DATASOURCE_URL");
        if (isLibpq(b)) {
            return b;
        }
        String bound = properties.getUrl();
        if (isLibpq(bound)) {
            return bound;
        }
        return null;
    }

    private static boolean isLibpq(String url) {
        if (url == null) {
            return false;
        }
        String u = url.trim();
        return u.startsWith("postgres://") || u.startsWith("postgresql://");
    }

    private record Parsed(String jdbcUrl, String username, String password) {}

    private static Parsed parseLibpq(String raw) throws URISyntaxException {
        String s = raw.trim();
        if (s.startsWith("postgres://")) {
            s = "http://" + s.substring("postgres://".length());
        } else if (s.startsWith("postgresql://")) {
            s = "http://" + s.substring("postgresql://".length());
        } else {
            throw new URISyntaxException(raw, "expected postgres:// URL");
        }
        URI parsed = new URI(s);
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
            throw new URISyntaxException(raw, "missing database name");
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
        return new Parsed(jdbc.toString(), user, pass);
    }

    private static String decode(String s) {
        return URLDecoder.decode(s, StandardCharsets.UTF_8);
    }
}
