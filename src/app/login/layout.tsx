import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In / Sign Up',
  description: 'Sign in to LeetCode FSRS to review due problems, sync submissions, and master data structures & algorithms.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
