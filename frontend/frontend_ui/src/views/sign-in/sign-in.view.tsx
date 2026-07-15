// TODO: endpoint POST /auth/v1/magiclink not found in openapi-specs — verify with backend team
// Auth service is not in scope for this build; using a stub implementation.
import { type ChangeEvent, type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignInUI } from './sign-in.ui';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function SignInView() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setClientError(null);
    setServerError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!email.trim() || !isValidEmail(email.trim())) {
      setClientError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setClientError(null);
    setServerError(null);

    try {
      // TODO: endpoint POST /auth/v1/magiclink not found in openapi-specs — verify with backend team
      // Stub: simulate a successful magic link dispatch
      await new Promise<void>((resolve) => setTimeout(resolve, 800));
      navigate('/magic-link-sent', { state: { email: email.trim() } });
    } catch {
      setIsSubmitting(false);
      setServerError('Something went wrong. Please try again.');
    }
  };

  return (
    <SignInUI
      email={email}
      isSubmitting={isSubmitting}
      clientError={clientError}
      serverError={serverError}
      onEmailChange={handleEmailChange}
      onSubmit={handleSubmit}
    />
  );
}
