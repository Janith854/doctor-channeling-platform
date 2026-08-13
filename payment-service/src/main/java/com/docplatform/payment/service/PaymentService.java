package com.docplatform.payment.service;

import com.docplatform.payment.dto.request.PaymentRequest;
import com.docplatform.payment.dto.request.RefundRequest;
import com.docplatform.payment.dto.response.PaymentIntentResponse;
import com.docplatform.payment.entity.Payment;

import java.util.List;
import java.util.UUID;

public interface PaymentService {

    PaymentIntentResponse createPayment(PaymentRequest request);

    Payment getPaymentById(UUID id);

    List<Payment> getPaymentByAppointment(UUID appointmentId);

    List<Payment> getPatientPayments(UUID patientId);

    Payment confirmPayment(UUID id);

    Payment markPaymentFailed(UUID id, String reason);

    Payment refundPayment(UUID id, RefundRequest request);

    Payment cancelPayment(UUID id);

    void processStripeWebhook(String payload, String sigHeader);
}
