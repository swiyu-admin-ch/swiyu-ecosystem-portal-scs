FROM bit-base-images-docker-hosted.nexus.bit.admin.ch/bit/eclipse-temurin:25-jre-ubi9-minimal

USER 0
EXPOSE 8080


COPY swiyu-ecosystem-portal-service/target/swiyu-ecosystem-portal-service.jar /app/
COPY assets/entrypoint.sh /app/

# Update Java truststores, ad wee nedd to be able to add certificates at runtime
RUN set -uxe && \
    chmod g=u /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh && \
    # Update Java truststores, ad we need to be able to add certificates at runtime
    chmod g=u $JAVA_HOME/lib/security/cacerts

WORKDIR /app

USER 1001

ENTRYPOINT ["/app/entrypoint.sh", "swiyu-ecosystem-portal-service.jar"]
