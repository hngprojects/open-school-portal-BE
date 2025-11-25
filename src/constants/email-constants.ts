/**
 * Defines the filenames for email templates.
 * This ensures we use constants instead of magic strings.
 */
export enum EmailTemplateID {
  WAITLIST_WELCOME = 'waitlist-welcome.njk',
  FORGOT_PASSWORD = 'forgot-password.njk',
  CONTACT_ADMIN_NOTIFICATION = 'contact-admin-notification.njk',
  CONTACT_USER_CONFIRMATION = 'contact-user-confirmation.njk',
}

export const EMAIL_SERVICE_NAME = 'EMAIL_SERVICE';
export const EMAIL_QUEUE = 'email_queue';
export const EMAIL_PATTERN = 'send_email';
export const EMAIL_DLQ = 'email_dlq';
