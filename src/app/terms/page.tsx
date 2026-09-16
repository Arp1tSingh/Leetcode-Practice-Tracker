import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowLeft, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Review the terms and conditions for using LeetCode FSRS spaced repetition practice system.',
};

export default function TermsPage() {
  const lastUpdated = 'September 16, 2026';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            <FileText className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mt-2">Last updated: {lastUpdated}</p>
      </div>

      <div className="space-y-8 text-foreground/90 leading-relaxed">
        <div className="glass p-6 sm:p-8 rounded-3xl border border-border/60 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            1. Acceptance of Terms
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            By creating an account, accessing, or using LeetCode FSRS, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
          </p>
        </div>

        <div className="glass p-6 sm:p-8 rounded-3xl border border-border/60 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-primary" />
            2. Service Description & Educational Purpose
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            LeetCode FSRS is an educational productivity application implementing the Free Spaced Repetition Scheduler (FSRS) to help engineers review coding problem patterns. The service provides scheduling algorithms, review queues, and progress tracking tools.
          </p>
        </div>

        <div className="glass p-6 sm:p-8 rounded-3xl border border-border/60 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-primary" />
            3. Disclaimer Regarding LeetCode
          </h2>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm leading-relaxed">
            <strong>Important Trademark & Affiliation Notice:</strong> LeetCode FSRS is an independent open-source project and is not endorsed by, directly affiliated with, maintained, authorized, or sponsored by LeetCode Inc. &quot;LeetCode&quot; is a registered trademark of LeetCode Inc.
          </div>
        </div>

        <div className="glass p-6 sm:p-8 rounded-3xl border border-border/60 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            4. User Responsibilities & Acceptable Use
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>You are responsible for safeguarding your login credentials and activity under your account.</li>
            <li>You agree not to abuse, overburden, or exploit API endpoints or automated synchronization mechanisms.</li>
            <li>You agree not to upload malicious code, engage in scraping that violates provider rate limits, or disrupt the platform.</li>
          </ul>
        </div>

        <div className="glass p-6 sm:p-8 rounded-3xl border border-border/60 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            5. Limitation of Liability
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. In no event shall LeetCode FSRS or its contributors be liable for any direct, indirect, incidental, or consequential damages resulting from your use or inability to use the platform.
          </p>
        </div>

        <div className="glass p-6 sm:p-8 rounded-3xl border border-border/60 space-y-4">
          <h2 className="text-xl font-bold">6. Contact & Questions</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you have questions about these Terms, you may reach out to us at{' '}
            <a href="mailto:support@leetcodefsrs.com" className="text-primary hover:underline font-medium">
              support@leetcodefsrs.com
            </a>{' '}
            or submit an issue on our GitHub repository.
          </p>
        </div>
      </div>
    </div>
  );
}
