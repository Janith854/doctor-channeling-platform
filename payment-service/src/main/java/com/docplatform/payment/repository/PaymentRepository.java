package com.docplatform.payment.repository;

import com.docplatform.payment.entity.Payment;
import com.docplatform.payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findByAppointmentId(UUID appointmentId);

    List<Payment> findByPatientId(UUID patientId);

    Optional<Payment> findByProviderPaymentId(String providerPaymentId);

    List<Payment> findByStatus(PaymentStatus status);
}
