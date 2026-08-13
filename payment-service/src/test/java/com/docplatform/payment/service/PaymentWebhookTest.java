package com.docplatform.payment.service;

import com.docplatform.payment.config.StripeConfig;
import com.docplatform.payment.dto.mapper.PaymentMapper;
import com.docplatform.payment.entity.Payment;
import com.docplatform.payment.entity.PaymentStatus;
import com.docplatform.payment.repository.PaymentRepository;
import com.docplatform.payment.service.impl.PaymentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Payment Webhook Unit Tests")
class PaymentWebhookTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private StripePaymentService stripePaymentService;

    @Mock
    private PaymentMapper paymentMapper;

    @Mock
    private StripeConfig stripeConfig;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Payment payment;

    @BeforeEach
    void setUp() {
        payment = Payment.builder()
                .id(UUID.randomUUID())
                .appointmentId(UUID.randomUUID())
                .patientId(UUID.randomUUID())
                .amount(new BigDecimal("75.00"))
                .currency("USD")
                .providerPaymentId("pi_test_webhook_123")
                .status(PaymentStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("processStripeWebhook - should update payment to SUCCESS on payment_intent.succeeded event")
    void processStripeWebhook_shouldUpdateToSuccess() {
        when(stripeConfig.getWebhookSecret()).thenReturn(null); // dev mode
        when(paymentRepository.findByProviderPaymentId("pi_test_webhook_123")).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        String jsonPayload = """
                {
                  "id": "evt_test_123",
                  "object": "event",
                  "type": "payment_intent.succeeded",
                  "data": {
                    "object": {
                      "id": "pi_test_webhook_123",
                      "object": "payment_intent",
                      "amount": 7500,
                      "currency": "usd",
                      "status": "succeeded"
                    }
                  }
                }
                """;

        paymentService.processStripeWebhook(jsonPayload, null);

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(payment.getPaidAt()).isNotNull();
        verify(paymentRepository, times(1)).save(payment);
    }

    @Test
    @DisplayName("processStripeWebhook - should update payment to FAILED on payment_intent.payment_failed event")
    void processStripeWebhook_shouldUpdateToFailed() {
        when(stripeConfig.getWebhookSecret()).thenReturn(null);
        when(paymentRepository.findByProviderPaymentId("pi_test_webhook_123")).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        String jsonPayload = """
                {
                  "id": "evt_test_456",
                  "object": "event",
                  "type": "payment_intent.payment_failed",
                  "data": {
                    "object": {
                      "id": "pi_test_webhook_123",
                      "object": "payment_intent",
                      "amount": 7500,
                      "currency": "usd",
                      "status": "requires_payment_method"
                    }
                  }
                }
                """;

        paymentService.processStripeWebhook(jsonPayload, null);

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.FAILED);
        assertThat(payment.getFailedAt()).isNotNull();
        verify(paymentRepository, times(1)).save(payment);
    }
}
