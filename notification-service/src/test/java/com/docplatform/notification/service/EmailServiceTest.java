package com.docplatform.notification.service;

import com.docplatform.notification.exception.NotificationSendException;
import com.docplatform.notification.service.impl.EmailServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmailService Unit Tests")
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailServiceImpl emailService;

    @Test
    @DisplayName("sendEmail - should successfully send simple mail message")
    void sendEmail_shouldSendSuccessfully() {
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        assertThatCode(() -> emailService.sendEmail("test@example.com", "Test Subject", "Test Body"))
                .doesNotThrowAnyException();

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    @DisplayName("sendEmail - should throw NotificationSendException when mail sender fails")
    void sendEmail_shouldThrowNotificationSendException_whenMailSenderFails() {
        doThrow(new MailSendException("SMTP error")).when(mailSender).send(any(SimpleMailMessage.class));

        assertThatThrownBy(() -> emailService.sendEmail("test@example.com", "Test Subject", "Test Body"))
                .isInstanceOf(NotificationSendException.class)
                .hasMessageContaining("Failed to send email");

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }
}
