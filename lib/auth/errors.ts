export type CognitoErrorName =
  | "NotAuthorizedException"
  | "UserNotFoundException"
  | "UserNotConfirmedException"
  | "UsernameExistsException"
  | "InvalidPasswordException"
  | "CodeMismatchException"
  | "ExpiredCodeException"
  | "CodeDeliveryFailureException"
  | "LimitExceededException"
  | "TooManyRequestsException"
  | "TooManyFailedAttemptsException"
  | "PasswordResetRequiredException"
  | "InvalidParameterException";

export function getCognitoErrorName(error: unknown): CognitoErrorName | null {
  if (typeof error === "object" && error !== null && "name" in error) {
    return (error as { name: CognitoErrorName }).name;
  }
  return null;
}

export function cognitoErrorMessage(error: unknown): string {
  const fallback =
    error instanceof Error ? error.message : "Something went wrong. Please try again.";
  const name = getCognitoErrorName(error);

  switch (name) {
    case "NotAuthorizedException":
    case "UserNotFoundException":
      return "Email or password is incorrect.";
    case "UserNotConfirmedException":
      return "Your email isn't verified yet. Check your inbox for a code.";
    case "UsernameExistsException":
      return "An account with this email already exists. Try signing in instead.";
    case "InvalidPasswordException":
      return "Password doesn't meet the requirements. Use 12+ characters with mixed case, a number, and a symbol.";
    case "CodeMismatchException":
      return "That code doesn't match. Check your email and try again.";
    case "ExpiredCodeException":
      return "That code expired. Request a new one below.";
    case "CodeDeliveryFailureException":
      return "We couldn't send the code. Try again in a moment.";
    case "LimitExceededException":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "TooManyRequestsException":
      return "Too many requests. Slow down a bit.";
    case "TooManyFailedAttemptsException":
      return "Too many failed attempts. Try again later or reset your password.";
    case "PasswordResetRequiredException":
      return "You need to reset your password.";
    default:
      return fallback;
  }
}
