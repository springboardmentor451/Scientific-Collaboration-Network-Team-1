import logging

from app.core.interfaces import IEmailNotifier

# import os
# import smtplib
# from email.mime.multipart import MIMEMultipart
# from email.mime.text import MIMEText

# from fastapi import HTTPException

logger: logging.Logger = logging.getLogger(__name__)


class EmailNotifier(IEmailNotifier):
    def __init__(self, smtp_config=None) -> None:
        self.smtp_config = smtp_config

    def send_verification_email(self, email: str, code: str) -> None:
        """
        Send OTP verification code to user email.
        Real world: uncomment SMTP block and add credentials to .env
        Demo: prints to console
        """
        # shown in console - user copies this into swagger
        print(f"\n{'= ' * 50}\nVerification Code for {email} is {code}\n{'= ' * 50}\n")
        logger.info("verification code generated for: %s", email)

        # try:
        #     smtp_host: str = os.environ.get("SMTP_HOST", "smtp.gmail.com")
        #     smtp_port = int(os.environ.get("SMTP_PORT", "587"))
        #     smtp_user: str = os.environ.get("SMTP_USER", "")
        #     smtp_pass: str = os.environ.get("SMTP_PASSWORD", "")

        #     message = MIMEMultipart()
        #     message["From"] = smtp_user
        #     message["To"] = email
        #     message["Subject"] = "Research Platform - Email Verification"

        #     body: str = f"""
        #     Your verification code is: {code}
        #     This code expires in 5 minutes.
        #     If you did not register, ignore this email.
        #     """
        #     message.attach(MIMEText(body, "plain"))

        #     with smtplib.SMTP(smtp_host, smtp_port) as server:
        #         server.starttls()
        #         server.login(smtp_user, smtp_pass)
        #         server.sendmail(smtp_user, email, message.as_string())

        #     logger.info("OTP email sent to: %s", email)

        # except smtplib.SMTPException as e:
        #     logger.error("failed to send OTP email to %s: %s", email, e)
        #     raise HTTPException(status_code=500, detail="failed to send verification email")

    def send_approval_notification(self, email: str) -> None:
        """
        Notify user their account has been approved.
        Demo: prints to console
        """
        # shown in console - user copies this into swagger
        print(
            f"\n{'= ' * 50}\nAccount Approved\nEmail : {email}\nYour account has been approved. You can now login.\n{'= ' * 50}\n"
        )
        logger.info("approval notification sent to: %s", email)

        # message = MIMEMultipart()
        # message["From"] = smtp_user
        # message["To"] = email
        # message["Subject"] = "Research Platform — Account Approved"
        # body = """
        # Your account has been approved by the administrator.
        # You can now login at: http://localhost:5173/login
        # """
        # message.attach(MIMEText(body, "plain"))
        # ... send via SMTP

    def send_rejection_notification(self, email: str) -> None:
        """
        Notify user their account has been rejected.
        Demo: prints to console
        """
        # shown in console - user copies this into swagger
        print(
            f"\n{'= ' * 50}\nAccount Rejected\nEmail : {email}\nYour registration was not approved.\n{'= ' * 50}\n"
        )
        logger.warning("rejection notification sent to: %s", email)

        # message = MIMEMultipart()
        # message["From"] = smtp_user
        # message["To"] = email
        # message["Subject"] = "Research Platform — Account Rejected"
        # body = """
        # Your account has been rejected by the administrator.
        # """
        # message.attach(MIMEText(body, "plain"))
        # ... send via SMTP

    def send_ban_notification(self, email: str) -> None:
        """
        Notify user their account has been rejected.
        Demo: prints to console
        """
        # shown in console - user copies this into swagger
        print(
            f"\n{'= ' * 50}\nAccount Banned\nEmail : {email}\nYour account has been banned by the administrator.\n{'= ' * 50}\n"
        )
        logger.warning("account banned notification sent to: %s", email)

        # message = MIMEMultipart()
        # message["From"] = smtp_user
        # message["To"] = email
        # message["Subject"] = "Research Platform — Account Banned"
        # body = """
        # Your account has been banned by the administrator.
        # """
        # message.attach(MIMEText(body, "plain"))
        # ... send via SMTP
