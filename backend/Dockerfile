# ---------- Build stage ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Pull Maven Central through a mirror (avoids 429 rate limits on shared build hosts)
COPY maven-settings.xml /root/.m2/settings.xml

COPY pom.xml .
COPY src ./src
RUN mvn -B clean package -DskipTests \
        -Daether.transport.http.retryHandler.count=5 \
    && cp target/*.jar app.jar

# ---------- Runtime stage ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring

COPY --from=build /app/app.jar app.jar

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
