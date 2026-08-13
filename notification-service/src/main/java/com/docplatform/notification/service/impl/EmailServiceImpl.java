package com.docplatform.notification.service.impl;

import com.docplatform.notification.exception.NotificationSendException;
import com.docplatform.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendEmail(String to, String subject, String body) {
        log.info("Attempting to send email to: {} with subject: {}", to, subject);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email successfully sent to: {}", to);
        } catch (Exception ex) {
            log.error("Failed to send email to: {}. Error: {}", to, ex.getMessage(), ex);
            throw new NotificationSendException("Failed to send email to " + to + ": " + ex.getMessage(), ex);
        }
    }
}
