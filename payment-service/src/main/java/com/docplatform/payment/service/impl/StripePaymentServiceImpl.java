package com.docplatform.payment.service.impl;

import com.docplatform.payment.config.StripeConfig;
import com.docplatform.payment.exception.PaymentProcessingException;
import com.docplatform.payment.exception.RefundException;
import com.docplatform.payment.service.StripePaymentResult;
import com.docplatform.payment.service.StripePaymentService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class StripePaymentServiceImpl implements StripePaymentService {

    private final StripeConfig stripeConfig;

    @Override
    public StripePaymentResult createPaymentIntent(BigDecimal amount, String currency, String description, Map<String, String> metadata) {
        log.info("Creating Stripe PaymentIntent for amount: {} {}, description: {}", amount, currency, description);

        // If secret key is not configured, support local development with simulated PaymentIntent
        if (stripeConfig.getSecretKey() == null || stripeConfig.getSecretKey().isBlank()) {
            log.info("No Stripe secret key configured. Generating simulated PaymentIntent for local development.");
            String simulatedId = "pi_mock_" + UUID.randomUUID();
            return StripePaymentResult.builder()
                    .paymentIntentId(simulatedId)
                    .clientSecret(simulatedId + "_secret_mock")
                    .status("requires_payment_method")
                    .amount(amount)
                    .currency(currency)
                    .build();
        }

        try {
            long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();

            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(currency.toLowerCase())
                    .setDescription(description)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    );

            if (metadata != null && !metadata.isEmpty()) {
                paramsBuilder.putAllMetadata(metadata);
            }

            PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());
            log.info("Stripe PaymentIntent created with ID: {}", paymentIntent.getId());

            return StripePaymentResult.builder()
                    .paymentIntentId(paymentIntent.getId())
                    .clientSecret(paymentIntent.getClientSecret())
                    .status(paymentIntent.getStatus())
                    .amount(amount)
                    .currency(currency)
                    .build();
        } catch (StripeException e) {
            log.error("Stripe error creating PaymentIntent: {}", e.getMessage(), e);
            throw new PaymentProcessingException("Failed to create Stripe PaymentIntent: " + e.getMessage(), e);
        }
    }

    @Override
    public StripePaymentResult confirmPayment(String paymentIntentId) {
        log.info("Confirming Stripe PaymentIntent: {}", paymentIntentId);

        if (stripeConfig.getSecretKey() == null || stripeConfig.getSecretKey().isBlank()) {
            log.info("Simulating confirmation for PaymentIntent: {}", paymentIntentId);
            return StripePaymentResult.builder()
                    .paymentIntentId(paymentIntentId)
                    .status("succeeded")
                    .build();
        }

        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            return StripePaymentResult.builder()
                    .paymentIntentId(paymentIntent.getId())
                    .clientSecret(paymentIntent.getClientSecret())
                    .status(paymentIntent.getStatus())
                    .build();
        } catch (StripeException e) {
            log.error("Stripe error confirming PaymentIntent {}: {}", paymentIntentId, e.getMessage(), e);
            throw new PaymentProcessingException("Failed to confirm Stripe PaymentIntent: " + e.getMessage(), e);
        }
    }

    @Override
    public StripePaymentResult refundPayment(String paymentIntentId, BigDecimal amount, String reason) {
        log.info("Refunding Stripe PaymentIntent: {} with amount: {} and reason: {}", paymentIntentId, amount, reason);

        if (stripeConfig.getSecretKey() == null || stripeConfig.getSecretKey().isBlank()) {
            log.info("Simulating refund for PaymentIntent: {}", paymentIntentId);
            return StripePaymentResult.builder()
                    .paymentIntentId(paymentIntentId)
                    .status("refunded")
                    .amount(amount)
                    .build();
        }

        try {
            RefundCreateParams.Builder paramsBuilder = RefundCreateParams.builder()
                    .setPaymentIntent(paymentIntentId);

            if (amount != null) {
                long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
                paramsBuilder.setAmount(amountInCents);
            }

            if (reason != null && !reason.isBlank()) {
                paramsBuilder.putMetadata("reason", reason);
            }

            Refund refund = Refund.create(paramsBuilder.build());
            log.info("Stripe Refund created with ID: {} for PaymentIntent: {}", refund.getId(), paymentIntentId);

            return StripePaymentResult.builder()
                    .paymentIntentId(paymentIntentId)
                    .status(refund.getStatus())
                    .amount(amount)
                    .build();
        } catch (StripeException e) {
            log.error("Stripe error refunding PaymentIntent {}: {}", paymentIntentId, e.getMessage(), e);
            throw new RefundException("Failed to process refund with Stripe: " + e.getMessage(), e);
        }
    }
}
