package com.docplatform.payment.dto.response;

import com.docplatform.payment.entity.PaymentMethod;
import com.docplatform.payment.entity.PaymentProvider;
import com.docplatform.payment.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private UUID id;
    private UUID appointmentId;
    private UUID patientId;
    private BigDecimal amount;
    private String currency;
    private PaymentMethod paymentMethod;
    private PaymentProvider paymentProvider;
    private String providerPaymentId;
    private PaymentStatus status;
    private String description;
    private LocalDateTime paidAt;
    private LocalDateTime failedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
