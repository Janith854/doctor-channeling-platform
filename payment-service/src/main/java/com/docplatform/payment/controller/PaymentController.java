package com.docplatform.payment.controller;

import com.docplatform.payment.dto.mapper.PaymentMapper;
import com.docplatform.payment.dto.request.PaymentRequest;
import com.docplatform.payment.dto.request.RefundRequest;
import com.docplatform.payment.dto.response.PaymentIntentResponse;
import com.docplatform.payment.dto.response.PaymentResponse;
import com.docplatform.payment.entity.Payment;
import com.docplatform.payment.payload.ApiResponse;
import com.docplatform.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Validated
@Slf4j
@Tag(name = "Payment API", description = "Endpoints for handling payments, refunds, and Stripe webhooks")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;

    @PostMapping
    @Operation(summary = "Create a payment and initiate Stripe PaymentIntent")
    public ResponseEntity<ApiResponse<PaymentIntentResponse>> createPayment(
            @Valid @RequestBody PaymentRequest request) {
        PaymentIntentResponse response = paymentService.createPayment(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<PaymentIntentResponse>builder()
                        .success(true)
                        .message("Payment initiated successfully")
                        .data(response)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment details by ID")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable UUID id) {
        Payment payment = paymentService.getPaymentById(id);

        return ResponseEntity.ok(
                ApiResponse.<PaymentResponse>builder()
                        .success(true)
                        .message("Payment retrieved successfully")
                        .data(paymentMapper.toResponse(payment))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/appointment/{appointmentId}")
    @Operation(summary = "Get payments for an appointment")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByAppointment(
            @PathVariable UUID appointmentId) {
        List<Payment> payments = paymentService.getPaymentByAppointment(appointmentId);

        return ResponseEntity.ok(
                ApiResponse.<List<PaymentResponse>>builder()
                        .success(true)
                        .message("Appointment payments retrieved successfully")
                        .data(paymentMapper.toResponseList(payments))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get payments for a patient")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByPatient(
            @PathVariable UUID patientId) {
        List<Payment> payments = paymentService.getPatientPayments(patientId);

        return ResponseEntity.ok(
                ApiResponse.<List<PaymentResponse>>builder()
                        .success(true)
                        .message("Patient payments retrieved successfully")
                        .data(paymentMapper.toResponseList(payments))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping("/{id}/refund")
    @Operation(summary = "Refund a payment")
    public ResponseEntity<ApiResponse<PaymentResponse>> refundPayment(
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) RefundRequest request) {
        Payment payment = paymentService.refundPayment(id, request);

        return ResponseEntity.ok(
                ApiResponse.<PaymentResponse>builder()
                        .success(true)
                        .message("Payment refunded successfully")
                        .data(paymentMapper.toResponse(payment))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a pending payment")
    public ResponseEntity<ApiResponse<PaymentResponse>> cancelPayment(@PathVariable UUID id) {
        Payment payment = paymentService.cancelPayment(id);

        return ResponseEntity.ok(
                ApiResponse.<PaymentResponse>builder()
                        .success(true)
                        .message("Payment cancelled successfully")
                        .data(paymentMapper.toResponse(payment))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping("/webhook/stripe")
    @Operation(summary = "Handle Stripe Webhook events")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        log.info("Received Stripe webhook notification");
        paymentService.processStripeWebhook(payload, sigHeader);
        return ResponseEntity.ok("Webhook processed successfully");
    }
}
