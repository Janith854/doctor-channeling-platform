package com.docplatform.payment.service;

import com.docplatform.payment.config.StripeConfig;
import com.docplatform.payment.dto.mapper.PaymentMapper;
import com.docplatform.payment.dto.request.PaymentRequest;
import com.docplatform.payment.dto.request.RefundRequest;
import com.docplatform.payment.dto.response.PaymentIntentResponse;
import com.docplatform.payment.entity.Payment;
import com.docplatform.payment.entity.PaymentMethod;
import com.docplatform.payment.entity.PaymentProvider;
import com.docplatform.payment.entity.PaymentStatus;
import com.docplatform.payment.exception.BadRequestException;
import com.docplatform.payment.exception.InvalidPaymentStateException;
import com.docplatform.payment.exception.ResourceNotFoundException;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService Unit Tests")
class PaymentServiceTest {

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

    private UUID paymentId;
    private UUID appointmentId;
    private UUID patientId;
    private Payment payment;
    private PaymentRequest paymentRequest;

    @BeforeEach
    void setUp() {
        paymentId = UUID.randomUUID();
        appointmentId = UUID.randomUUID();
        patientId = UUID.randomUUID();

        payment = Payment.builder()
                .id(paymentId)
                .appointmentId(appointmentId)
                .patientId(patientId)
                .amount(new BigDecimal("50.00"))
                .currency("USD")
                .paymentMethod(PaymentMethod.CARD)
                .paymentProvider(PaymentProvider.STRIPE)
                .providerPaymentId("pi_test_12345")
                .status(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        paymentRequest = PaymentRequest.builder()
                .appointmentId(appointmentId)
                .patientId(patientId)
                .amount(new BigDecimal("50.00"))
                .currency("USD")
                .paymentMethod(PaymentMethod.CARD)
                .paymentProvider(PaymentProvider.STRIPE)
                .description("Test Fee")
                .build();
    }

    @Test
    @DisplayName("createPayment - should create pending payment and Stripe intent")
    void createPayment_shouldCreatePaymentAndIntent() {
        when(paymentMapper.toEntity(any(PaymentRequest.class))).thenReturn(payment);
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);
        when(stripePaymentService.createPaymentIntent(any(), any(), any(), any()))
                .thenReturn(StripePaymentResult.builder()
                        .paymentIntentId("pi_test_12345")
                        .clientSecret("pi_test_12345_secret_abc")
                        .status("requires_payment_method")
                        .amount(new BigDecimal("50.00"))
                        .currency("USD")
                        .build());

        PaymentIntentResponse response = paymentService.createPayment(paymentRequest);

        assertThat(response).isNotNull();
        assertThat(response.getPaymentId()).isEqualTo(paymentId);
        assertThat(response.getClientSecret()).isEqualTo("pi_test_12345_secret_abc");
        assertThat(response.getProviderPaymentId()).isEqualTo("pi_test_12345");
        verify(paymentRepository, atLeastOnce()).save(any(Payment.class));
    }

    @Test
    @DisplayName("createPayment - should throw BadRequestException on zero/negative amount")
    void createPayment_shouldThrow_whenZeroOrNegativeAmount() {
        paymentRequest.setAmount(BigDecimal.ZERO);

        assertThatThrownBy(() -> paymentService.createPayment(paymentRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Payment amount must be greater than zero");

        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("getPaymentById - should return payment when found")
    void getPaymentById_shouldReturnPayment_whenFound() {
        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));

        Payment result = paymentService.getPaymentById(paymentId);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(paymentId);
    }

    @Test
    @DisplayName("getPaymentById - should throw ResourceNotFoundException when not found")
    void getPaymentById_shouldThrow_whenNotFound() {
        when(paymentRepository.findById(paymentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.getPaymentById(paymentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Payment not found with id: " + paymentId);
    }

    @Test
    @DisplayName("confirmPayment - should transition PENDING to SUCCESS")
    void confirmPayment_shouldConfirm_whenPending() {
        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        Payment confirmed = paymentService.confirmPayment(paymentId);

        assertThat(confirmed.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(confirmed.getPaidAt()).isNotNull();
    }

    @Test
    @DisplayName("confirmPayment - should be idempotent when already SUCCESS")
    void confirmPayment_shouldBeIdempotent_whenAlreadySuccess() {
        payment.setStatus(PaymentStatus.SUCCESS);
        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));

        Payment result = paymentService.confirmPayment(paymentId);

        assertThat(result.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        verify(paymentRepository, never()).save(payment);
    }

    @Test
    @DisplayName("confirmPayment - should throw InvalidPaymentStateException when already cancelled")
    void confirmPayment_shouldThrow_whenCancelled() {
        payment.setStatus(PaymentStatus.CANCELLED);
        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));

        assertThatThrownBy(() -> paymentService.confirmPayment(paymentId))
                .isInstanceOf(InvalidPaymentStateException.class);
    }

    @Test
    @DisplayName("refundPayment - should refund successful payment")
    void refundPayment_shouldRefund_whenSuccess() {
        payment.setStatus(PaymentStatus.SUCCESS);
        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
        when(stripePaymentService.refundPayment(eq("pi_test_12345"), any(), any()))
                .thenReturn(StripePaymentResult.builder().status("refunded").build());

        RefundRequest refundReq = RefundRequest.builder().reason("Patient cancellation").build();
        Payment refunded = paymentService.refundPayment(paymentId, refundReq);

        assertThat(refunded.getStatus()).isEqualTo(PaymentStatus.REFUNDED);
        verify(stripePaymentService, times(1)).refundPayment(eq("pi_test_12345"), any(), eq("Patient cancellation"));
    }

    @Test
    @DisplayName("refundPayment - should throw InvalidPaymentStateException when not SUCCESS")
    void refundPayment_shouldThrow_whenPending() {
        payment.setStatus(PaymentStatus.PENDING);
        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));

        assertThatThrownBy(() -> paymentService.refundPayment(paymentId, null))
                .isInstanceOf(InvalidPaymentStateException.class)
                .hasMessageContaining("Only successful payments can be refunded");
    }

    @Test
    @DisplayName("cancelPayment - should cancel pending payment")
    void cancelPayment_shouldCancel_whenPending() {
        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        Payment cancelled = paymentService.cancelPayment(paymentId);

        assertThat(cancelled.getStatus()).isEqualTo(PaymentStatus.CANCELLED);
    }

    @Test
    @DisplayName("getPatientPayments - should return payments for patient")
    void getPatientPayments_shouldReturnPayments() {
        when(paymentRepository.findByPatientId(patientId)).thenReturn(List.of(payment));

        List<Payment> result = paymentService.getPatientPayments(patientId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPatientId()).isEqualTo(patientId);
    }
}
