package com.docplatform.payment.dto.request;

import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundRequest {

    private String reason;

    @DecimalMin(value = "0.50", message = "Refund amount must be at least 0.50 if specified")
    private BigDecimal amount;
}
