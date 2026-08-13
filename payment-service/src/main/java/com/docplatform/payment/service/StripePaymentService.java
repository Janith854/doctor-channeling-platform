package com.docplatform.payment.service;

import java.math.BigDecimal;
import java.util.Map;

public interface StripePaymentService {

    StripePaymentResult createPaymentIntent(BigDecimal amount, String currency, String description, Map<String, String> metadata);

    StripePaymentResult confirmPayment(String paymentIntentId);

    StripePaymentResult refundPayment(String paymentIntentId, BigDecimal amount, String reason);
}
