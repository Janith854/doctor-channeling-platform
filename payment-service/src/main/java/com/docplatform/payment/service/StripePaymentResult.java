package com.docplatform.payment.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StripePaymentResult {
    private String paymentIntentId;
    private String clientSecret;
    private String status;
    private BigDecimal amount;
    private String currency;
}
