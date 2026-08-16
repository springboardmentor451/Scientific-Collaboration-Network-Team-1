import logging
import smtplib
from dataclasses import dataclass
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import HTTPException

from app.core.interfaces import EmailNotifier

logger: logging.Logger = logging.getLogger(__name__)


@dataclass
class SMTPConfig:
    host: str
    port: int
    user: str
    password: str


class ConsoleEmailNotifier(EmailNotifier):
    def __init__(self) -> None:
        pass

    def send_verification_email(self, email: str, code: str) -> None:
        print(f"\n{'= ' * 50}\nVerification Code for {email} is {code}\n{'= ' * 50}\n")
        logger.info("verification code generated for: %s", email)

    def send_approval_notification(self, email: str) -> None:
        print(
            f"\n{'= ' * 50}\nAccount Approved\nEmail : {email}\nYour account has been approved. You can now login.\n{'= ' * 50}\n"
        )
        logger.info("approval notification sent to: %s", email)

    def send_rejection_notification(self, email: str) -> None:
        print(
            f"\n{'= ' * 50}\nAccount Rejected\nEmail : {email}\nYour registration was not approved.\n{'= ' * 50}\n"
        )
        logger.warning("rejection notification sent to: %s", email)

    def send_ban_notification(self, email: str) -> None:
        print(
            f"\n{'= ' * 50}\nAccount Banned\nEmail : {email}\nYour account has been banned by the administrator.\n{'= ' * 50}\n"
        )
        logger.warning("account banned notification sent to: %s", email)


class SMTPEmailNotifier(EmailNotifier):
    def __init__(self, smtp_config: SMTPConfig) -> None:
        self.smtp_config: SMTPConfig = smtp_config

    def _send_email(self, to: str, subject: str, body: str) -> None:
        try:
            message = MIMEMultipart()
            message["From"] = self.smtp_config.user
            message["To"] = to
            message["Subject"] = subject
            message.attach(MIMEText(body, "plain"))

            with smtplib.SMTP(self.smtp_config.host, self.smtp_config.port) as server:
                server.starttls()
                server.login(self.smtp_config.user, self.smtp_config.password)
                server.sendmail(self.smtp_config.user, to, message.as_string())
            logger.info("email sent to %s with subject '%s'", to, subject)

        except smtplib.SMTPException as e:
            logger.error("failed to send email to %s: %s", to, e)
            raise HTTPException(status_code=500, detail="failed to send email")

    def send_verification_email(self, email: str, code: str) -> None:
        body: str = f"""
        Your verification code is: {code}
        This code expires in 5 minutes.
        If you did not register, ignore this email.
        """
        self._send_email(email, "Research Platform - Email Verification", body)

    def send_approval_notification(self, email: str) -> None:
        body = "Your account has been approved by the administrator. You can now login."
        self._send_email(email, "Research Platform - Account Approved", body)

    def send_rejection_notification(self, email: str) -> None:
        body = """Your account has been rejected by the administrator."""
        self._send_email(email, "Research Platform — Account Rejected", body)

    def send_ban_notification(self, email: str) -> None:
        body = """Your account has been banned by the administrator."""
        self._send_email(email, "Research Platform — Account Banned", body)
