package com.docplatform.payment.service.impl;

import com.docplatform.payment.config.StripeConfig;
import com.docplatform.payment.dto.mapper.PaymentMapper;
import com.docplatform.payment.dto.request.PaymentRequest;
import com.docplatform.payment.dto.request.RefundRequest;
import com.docplatform.payment.dto.response.PaymentIntentResponse;
import com.docplatform.payment.entity.Payment;
import com.docplatform.payment.entity.PaymentStatus;
import com.docplatform.payment.exception.*;
import com.docplatform.payment.repository.PaymentRepository;
import com.docplatform.payment.service.PaymentService;
import com.docplatform.payment.service.StripePaymentResult;
import com.docplatform.payment.service.StripePaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final StripePaymentService stripePaymentService;
    private final PaymentMapper paymentMapper;
    private final StripeConfig stripeConfig;

    @Override
    @Transactional
    public PaymentIntentResponse createPayment(PaymentRequest request) {
        log.info("Initiating payment for appointment: {} and patient: {}, amount: {}",
                request.getAppointmentId(), request.getPatientId(), request.getAmount());

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }

        Payment payment = paymentMapper.toEntity(request);
        payment.setStatus(PaymentStatus.PENDING);
        Payment savedPayment = paymentRepository.save(payment);

        Map<String, String> metadata = new HashMap<>();
        metadata.put("appointmentId", request.getAppointmentId().toString());
        metadata.put("patientId", request.getPatientId().toString());
        metadata.put("paymentId", savedPayment.getId().toString());

        StripePaymentResult stripeResult = stripePaymentService.createPaymentIntent(
                request.getAmount(),
                request.getCurrency() != null ? request.getCurrency() : "USD",
                request.getDescription() != null ? request.getDescription() : "Doctor Channeling Appointment Fee",
                metadata
        );

        savedPayment.setProviderPaymentId(stripeResult.getPaymentIntentId());
        paymentRepository.save(savedPayment);

        log.info("Payment initiated with ID: {} and Stripe ID: {}", savedPayment.getId(), stripeResult.getPaymentIntentId());

        return PaymentIntentResponse.builder()
                .paymentId(savedPayment.getId())
                .clientSecret(stripeResult.getClientSecret())
                .providerPaymentId(stripeResult.getPaymentIntentId())
                .amount(savedPayment.getAmount())
                .currency(savedPayment.getCurrency())
                .status(savedPayment.getStatus())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Payment getPaymentById(UUID id) {
        log.info("Fetching payment with ID: {}", id);
        return paymentRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Payment not found with ID: {}", id);
                    return new ResourceNotFoundException("Payment not found with id: " + id);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> getPaymentByAppointment(UUID appointmentId) {
        log.info("Fetching payments for appointment ID: {}", appointmentId);
        return paymentRepository.findByAppointmentId(appointmentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> getPatientPayments(UUID patientId) {
        log.info("Fetching payments for patient ID: {}", patientId);
        return paymentRepository.findByPatientId(patientId);
    }

    @Override
    @Transactional
    public Payment confirmPayment(UUID id) {
        log.info("Confirming payment with ID: {}", id);
        Payment payment = getPaymentById(id);

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            log.info("Payment with ID {} is already marked as SUCCESS (idempotent)", id);
            return payment;
        }

        if (payment.getStatus() != PaymentStatus.PENDING && payment.getStatus() != PaymentStatus.PROCESSING) {
            throw new InvalidPaymentStateException("Cannot confirm payment in status: " + payment.getStatus());
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        Payment saved = paymentRepository.save(payment);
        log.info("Payment with ID {} successfully confirmed", id);
        return saved;
    }

    @Override
    @Transactional
    public Payment markPaymentFailed(UUID id, String reason) {
        log.info("Marking payment with ID: {} as FAILED. Reason: {}", id, reason);
        Payment payment = getPaymentById(id);

        if (payment.getStatus() == PaymentStatus.FAILED) {
            return payment;
        }

        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailedAt(LocalDateTime.now());
        if (reason != null && !reason.isBlank()) {
            payment.setDescription((payment.getDescription() != null ? payment.getDescription() + " - " : "") + reason);
        }
        Payment saved = paymentRepository.save(payment);
        log.info("Payment with ID {} marked as FAILED", id);
        return saved;
    }

    @Override
    @Transactional
    public Payment refundPayment(UUID id, RefundRequest request) {
        log.info("Processing refund for payment ID: {}", id);
        Payment payment = getPaymentById(id);

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new InvalidPaymentStateException("Only successful payments can be refunded. Current status: " + payment.getStatus());
        }

        BigDecimal refundAmount = (request != null && request.getAmount() != null) ? request.getAmount() : payment.getAmount();
        String reason = (request != null) ? request.getReason() : "Requested by user";

        stripePaymentService.refundPayment(payment.getProviderPaymentId(), refundAmount, reason);

        payment.setStatus(PaymentStatus.REFUNDED);
        Payment saved = paymentRepository.save(payment);
        log.info("Payment with ID {} successfully marked as REFUNDED", id);
        return saved;
    }

    @Override
    @Transactional
    public Payment cancelPayment(UUID id) {
        log.info("Cancelling payment with ID: {}", id);
        Payment payment = getPaymentById(id);

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new InvalidPaymentStateException("Only pending payments can be cancelled. Current status: " + payment.getStatus());
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        Payment saved = paymentRepository.save(payment);
        log.info("Payment with ID {} cancelled", id);
        return saved;
    }

    @Override
    @Transactional
    public void processStripeWebhook(String payload, String sigHeader) {
        log.info("Received Stripe webhook event");
        Event event;

        String webhookSecret = stripeConfig.getWebhookSecret();
        if (webhookSecret != null && !webhookSecret.isBlank() && sigHeader != null) {
            try {
                event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            } catch (SignatureVerificationException e) {
                log.error("Stripe signature verification failed: {}", e.getMessage());
                throw new WebhookValidationException("Invalid Stripe webhook signature", e);
            } catch (Exception e) {
                log.error("Error parsing Stripe webhook: {}", e.getMessage());
                throw new WebhookValidationException("Failed to parse Stripe webhook: " + e.getMessage(), e);
            }
        } else {
            // Local dev mode without webhook signature secret
            try {
                event = Event.GSON.fromJson(payload, Event.class);
            } catch (Exception e) {
                log.error("Failed to deserialize webhook JSON in dev mode: {}", e.getMessage());
                throw new WebhookValidationException("Failed to deserialize webhook JSON", e);
            }
        }

        if (event == null) {
            throw new WebhookValidationException("Webhook event is null");
        }

        log.info("Processing Stripe event type: {}", event.getType());

        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = null;
        if (dataObjectDeserializer != null) {
            stripeObject = dataObjectDeserializer.getObject().orElse(null);
            if (stripeObject == null) {
                try {
                    stripeObject = (StripeObject) dataObjectDeserializer.deserializeUnsafe();
                } catch (Exception e) {
                    log.warn("Could not deserialize Stripe object via deserializeUnsafe: {}", e.getMessage());
                }
            }
        }

        String paymentIntentId = null;
        if (stripeObject instanceof PaymentIntent paymentIntent) {
            paymentIntentId = paymentIntent.getId();
        } else if (event.getDataObjectDeserializer() != null && event.getDataObjectDeserializer().getRawJson() != null) {
            try {
                PaymentIntent pi = Event.GSON.fromJson(event.getDataObjectDeserializer().getRawJson(), PaymentIntent.class);
                if (pi != null) {
                    paymentIntentId = pi.getId();
                }
            } catch (Exception ignored) {
            }
        }

        if (paymentIntentId != null) {
            log.info("Processing Stripe PaymentIntent ID: {}", paymentIntentId);
            paymentRepository.findByProviderPaymentId(paymentIntentId).ifPresent(payment -> {
                switch (event.getType()) {
                    case "payment_intent.succeeded" -> {
                        if (payment.getStatus() != PaymentStatus.SUCCESS) {
                            payment.setStatus(PaymentStatus.SUCCESS);
                            payment.setPaidAt(LocalDateTime.now());
                            paymentRepository.save(payment);
                            log.info("Payment ID {} updated to SUCCESS from webhook", payment.getId());
                        }
                    }
                    case "payment_intent.payment_failed" -> {
                        if (payment.getStatus() != PaymentStatus.FAILED) {
                            payment.setStatus(PaymentStatus.FAILED);
                            payment.setFailedAt(LocalDateTime.now());
                            paymentRepository.save(payment);
                            log.info("Payment ID {} updated to FAILED from webhook", payment.getId());
                        }
                    }
                    case "payment_intent.processing" -> {
                        if (payment.getStatus() != PaymentStatus.PROCESSING) {
                            payment.setStatus(PaymentStatus.PROCESSING);
                            paymentRepository.save(payment);
                            log.info("Payment ID {} updated to PROCESSING from webhook", payment.getId());
                        }
                    }
                    case "payment_intent.canceled" -> {
                        if (payment.getStatus() != PaymentStatus.CANCELLED) {
                            payment.setStatus(PaymentStatus.CANCELLED);
                            paymentRepository.save(payment);
                            log.info("Payment ID {} updated to CANCELLED from webhook", payment.getId());
                        }
                    }
                    default -> log.info("Unhandled PaymentIntent event type: {}", event.getType());
                }
            });
        }
    }
}
