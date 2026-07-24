# ---------- Build ----------
    
FROM eclipse-temurin:24-jdk AS builder

WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

RUN chmod +x mvnw

RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw dependency:go-offline

COPY src/ src/

RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw clean package -DskipTests


# ---------- Runtime ----------

FROM eclipse-temurin:24-jre

WORKDIR /app

RUN useradd --system --create-home spring

COPY --from=builder \
    /app/target/*.jar \
    /app/app.jar

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER spring

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]