# ── ETAPA 1: COMPILACIÓN ──
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copiar pom.xml y descargar dependencias para aprovechar la caché de Docker
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar el código fuente y compilar el JAR omitiendo los tests
COPY src ./src
RUN mvn clean package -DskipTests

# ── ETAPA 2: EJECUCIÓN (JRE ligero) ──
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copiar el JAR generado en la etapa anterior
COPY --from=build /app/target/worksync-0.0.1-SNAPSHOT.jar app.jar

# Exponer el puerto por defecto (Render lo sobreescribirá)
EXPOSE 8080

# Comando de inicio seguro
# -XX:MaxRAMPercentage=75.0 le dice a la JVM que no use más del 75% de la RAM del contenedor (evita OOM en Render)
# --server.port=${PORT:8080} toma el puerto dinámico de Render o cae en el 8080 por defecto
ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar", "--server.port=${PORT:8080}"]
