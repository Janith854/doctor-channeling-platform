package com.docplatform.payment.dto.mapper;

import com.docplatform.payment.dto.request.PaymentRequest;
import com.docplatform.payment.dto.response.PaymentResponse;
import com.docplatform.payment.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    PaymentResponse toResponse(Payment payment);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "providerPaymentId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "paidAt", ignore = true)
    @Mapping(target = "failedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Payment toEntity(PaymentRequest request);

    List<PaymentResponse> toResponseList(List<Payment> payments);
}
