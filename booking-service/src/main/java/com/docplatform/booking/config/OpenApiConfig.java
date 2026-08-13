package com.docplatform.booking.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Appointment Service API",
                version = "1.0",
                description = "API documentation for Doctor Channeling Platform - Appointment Service",
                contact = @Contact(name = "Doctor Channeling Team"),
                license = @License(name = "MIT License")
        )
)
public class OpenApiConfig {
}
