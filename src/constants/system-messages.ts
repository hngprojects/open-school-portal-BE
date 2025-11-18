export const SYS_MSG = {
  // Waitlist messages
  WAITLIST_ADDED_SUCCESSFULLY: 'Successfully added to waitlist',
  WAITLIST_RETRIEVED_SUCCESSFULLY: 'Waitlist entries retrieved successfully',
  EMAIL_ALREADY_EXISTS: 'Email already exists in waitlist',
  WAITLIST_REMOVED_SUCCESSFULLY: 'Entry removed from waitlist successfully',

  // General messages
  OPERATION_SUCCESSFUL: 'Operation completed successfully',
  INTERNAL_SERVER_ERROR: 'Internal server error occurred',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Bad request',

  // Auth messages
  REQUEST_PASSWORD_RESET_SUCCESS:
    'Password reset request received. If a user with this email exists, an OTP will be sent.',
  RESET_PASSWORD_SUCCESS: 'Password has been reset successfully',
  EMAIL_NOT_FOUND: 'User with this email address not found',
  INVALID_OTP: 'The provided OTP is invalid or has expired',
  USER_NOT_FOUND: 'User not found',
};
