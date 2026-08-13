package com.docplatform.payment.service;

import com.docplatform.payment.config.StripeConfig;
import com.docplatform.payment.service.impl.StripePaymentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("StripePaymentService Unit Tests")
class StripePaymentServiceTest {

    @Mock
    private StripeConfig stripeConfig;

    @InjectMocks
    private StripePaymentServiceImpl stripePaymentService;

    @BeforeEach
    void setUp() {
        // Without real secret key, test fallback simulation
        when(stripeConfig.getSecretKey()).thenReturn(null);
    }

    @Test
    @DisplayName("createPaymentIntent - fallback mode should generate mock payment intent")
    void createPaymentIntent_fallbackMode_shouldGenerateMockIntent() {
        Map<String, String> metadata = new HashMap<>();
        metadata.put("appointmentId", "test-123");

        StripePaymentResult result = stripePaymentService.createPaymentIntent(
                new BigDecimal("100.00"), "USD", "Test fee", metadata);

        assertThat(result).isNotNull();
        assertThat(result.getPaymentIntentId()).startsWith("pi_mock_");
        assertThat(result.getClientSecret()).contains("_secret_mock");
        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(result.getCurrency()).isEqualTo("USD");
    }

    @Test
    @DisplayName("confirmPayment - fallback mode should return succeeded status")
    void confirmPayment_fallbackMode_shouldReturnSucceeded() {
        StripePaymentResult result = stripePaymentService.confirmPayment("pi_mock_12345");

        assertThat(result).isNotNull();
        assertThat(result.getPaymentIntentId()).isEqualTo("pi_mock_12345");
        assertThat(result.getStatus()).isEqualTo("succeeded");
    }

    @Test
    @DisplayName("refundPayment - fallback mode should return refunded status")
    void refundPayment_fallbackMode_shouldReturnRefunded() {
        StripePaymentResult result = stripePaymentService.refundPayment(
                "pi_mock_12345", new BigDecimal("50.00"), "Patient requested");

        assertThat(result).isNotNull();
        assertThat(result.getPaymentIntentId()).isEqualTo("pi_mock_12345");
        assertThat(result.getStatus()).isEqualTo("refunded");
    }
}
