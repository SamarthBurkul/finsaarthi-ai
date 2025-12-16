export interface SignInValues {
  email: string;
  password: string;
}

export interface SignUpValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type AuthPageName = "signin" | "signup";

export interface AuthPageProps {
  /**
   * Optional email/password sign-in handler
   */
  onEmailSignIn?: (values: SignInValues) => Promise<void> | void;

  /**
   * Optional email/password sign-up handler
   */
  onEmailSignUp?: (values: SignUpValues) => Promise<void> | void;

  /**
   * Shared Google auth handler
   */
  onGoogleAuth?: () => Promise<void> | void;

  /**
   * Optional navigation callback to switch between auth pages
   */
  onNavigateTo?: (page: AuthPageName) => void;
}