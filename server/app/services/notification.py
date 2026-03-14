"""Notifications: approval/rejection and delivery + feedback link.
Email via Resend (free tier: 100/day). Set RESEND_API_KEY to enable."""
from __future__ import annotations

import asyncio
import logging

from app.config import settings

_log = logging.getLogger(__name__)


def _send_email_sync(to_email: str, volunteer_name: str, donor_name: str, feedback_url: str) -> bool:
    """Synchronous Resend send (run in thread to avoid blocking)."""
    import resend
    resend.api_key = settings.resend_api_key
    from_addr = getattr(settings, "email_from", None) or "Leftover Link <onboarding@resend.dev>"
    html = (
        f"<p>Hello,</p>"
        f"<p><strong>{volunteer_name}</strong> has successfully delivered the food from <strong>{donor_name}</strong>.</p>"
        f"<p>Hope you are happy with the service.</p>"
        f"<p>Please take a moment to share your feedback (food quality, any issues, etc.):</p>"
        f'<p><a href="{feedback_url}" style="background:#0f766e;color:#fff;padding:10px 20px;text-decoration:none;border-radius:8px;">Give feedback</a></p>'
        f"<p>Thank you!</p>"
    )
    params = {
        "from": from_addr,
        "to": [to_email],
        "subject": "Food delivered – please share your feedback",
        "html": html,
    }
    resend.Emails.send(params)
    return True


async def send_delivery_notification(
    to_email: str,
    volunteer_name: str,
    donor_name: str,
    feedback_url: str,
) -> bool:
    """Send email to end user with delivery confirmation and feedback link. Returns True if sent."""
    if not settings.resend_api_key:
        _log.info(
            "Delivery notification (no RESEND_API_KEY): would email %s: %s received from %s. Feedback link: %s",
            to_email, volunteer_name, donor_name, feedback_url,
        )
        return False
    try:
        await asyncio.to_thread(
            _send_email_sync, to_email, volunteer_name, donor_name, feedback_url
        )
        _log.info("Delivery notification sent to %s", to_email)
        return True
    except Exception as e:
        _log.exception("Failed to send delivery email to %s: %s", to_email, e)
        return False


async def notify_user_approved(user_id: str, email: str | None, username: str) -> None:
    """Notify user their account was approved. Use email or push in production."""
    # TODO: Send email via SMTP or provider (e.g. SendGrid, Resend)
    # TODO: Or send push notification
    if email:
        # Placeholder: log; replace with actual send
        import logging
        logging.getLogger(__name__).info(
            "Approval notification (would send email to %s for user %s)", email, username
        )


async def notify_user_rejected(user_id: str, email: str | None, username: str) -> None:
    """Notify user their account was rejected."""
    if email:
        import logging
        logging.getLogger(__name__).info(
            "Rejection notification (would send email to %s for user %s)", email, username
        )
