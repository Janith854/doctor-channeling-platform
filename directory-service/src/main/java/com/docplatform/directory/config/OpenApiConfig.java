package com.docplatform.directory.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI directoryServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Directory Service API")
                        .description("API Documentation for Doctor Channeling Platform - Directory Service")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("DocPlatform Team")
                                .email("dev@docplatform.com"))
                        .license(new License().name("Apache 2.0").url("http://springdoc.org")));
    }
}
