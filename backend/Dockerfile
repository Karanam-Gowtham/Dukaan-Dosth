# ---- Build ----
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B -q -DskipTests package

# ---- Run ----
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Render and other PaaS set PORT; default 8080 for local Docker
ENV PORT=8080
EXPOSE 8080

COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar /app/app.jar

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
