# ==========================================
# Stage 1: Build the Application
# ==========================================
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and POM configuration files first to leverage Docker layer caching
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Download dependencies (this layer will be cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -B

# Copy the rest of the source code
COPY src ./src

# Package the application (skip tests for faster deployment builds)
RUN ./mvnw clean package -DskipTests

# ==========================================
# Stage 2: Minimal Runtime Environment
# ==========================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create system group and non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only the compiled JAR from the builder stage
COPY --from=builder /app/target/chat-app-backend-0.0.1-SNAPSHOT.jar app.jar

# Fix ownership
RUN chown appuser:appgroup app.jar

USER appuser

# Expose Spring Boot's dynamic/default port
EXPOSE 8081

# Force JVM to read SPRING_DATA_MONGODB_URI explicitly as a system property
ENTRYPOINT ["sh", "-c", "java -XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Dspring.data.mongodb.uri=${SPRING_DATA_MONGODB_URI} -jar app.jar"]