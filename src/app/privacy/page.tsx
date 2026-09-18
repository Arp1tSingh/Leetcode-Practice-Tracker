import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, Database, Eye, Cookie, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Understand how LeetCode FSRS protects your data, session information, and review history.',
};

export default function PrivacyPolicyPage() {
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
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Legal & Security</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mt-2">Last updated: {lastUpdated}</p>
      </div>

      <div className="space-y-8 text-foreground/90 leading-relaxed">
        <div className="glass p-6 sm:p-8 rounded-3xl border border-border/60 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-primary" />
            1. Overview
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            LeetCode FSRS (&quot;we&quot;, &quot;our&quot;, or &quot;the service&quot;) provides a spaced repetition review and tracking tool designed for software developers practicing algorithmic problem solving. We respect your privacy and are committed to transparency in how your information is handled.
          </p>
        </div>

        <div className="glass p-6 sm:p-8 rounded-3xl border border-border/60 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2.5">
            <Database className="w-5 h-5 text-primary" />
            2. Information We Collect
          </h2>
          <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Account Credentials:</strong> Your chosen username, optional recovery email address, and a cryptographically hashed password (salted using bcrypt; we never store plain-text passwords).
            </li>
            <li>
              <strong className="text-foreground">Review & Practice Data:</strong> Problems you log, difficulty ratings, memory retention parameters computed by the Free Spaced Repetition Scheduler (FSRS), custom pattern notes, and review timestamps.
            </li>
            <li>
              <strong className="text-foreground">LeetCode Sync Data:</strong> If you utilize our auto-sync or manual sync features, we query public submission records corresponding to your LeetCode username via public APIs to populate your review queue.
            </li>
          </ul>
        </div>

        <div className="glass p-6 sm:p-8 rounded-3xl border border-border/60 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2.5">
            <Cookie className="w-5 h-5 text-primary" />
            3. Cookies & Local Storage
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use strictly necessary cookies to maintain secure authentication sessions via NextAuth. In addition, we utilize your browser&apos;s <code className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono">localStorage</code> to remember your interface preferences (such as light/dark theme and table filter selections). We do not sell or trade your data with third-party advertisers.
          </p>
        </div>

        <div className="glass p-6 sm:p-8 rounded-3xl border border-border/60 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-primary" />
            4. Hosting & Infrastructure
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our application is hosted on Vercel and backed by managed PostgreSQL databases on Supabase with TLS encryption in transit and AES encryption at rest. Anonymous platform telemetry may be captured via Vercel Analytics solely to diagnose latency, monitor uptime, and improve rendering performance.
          </p>
        </div>

        <div className="glass p-6 sm:p-8 rounded-3xl border border-border/60 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-primary" />
            5. Contact Information & Data Requests
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You retain the right to inspect, export, or delete your account data at any time. For privacy inquiries, data deletion requests, or technical support, please contact us:
          </p>
          <div className="p-4 rounded-2xl bg-secondary/50 border border-border/40 text-sm space-y-1">
            <p><strong className="text-foreground">Email:</strong> <a href="mailto:rpit.singh2000@gmail.com" className="text-primary hover:underline">support@leetcodefsrs.com</a></p>
            <p><strong className="text-foreground">Project Repository:</strong> <a href="https://github.com/Arp1tSingh/Leetcode-Practice-Tracker" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub / LeetCode FSRS</a></p>
            <p><strong className="text-foreground">Correspondence:</strong> Digital Nomad / Remote Open Source Operations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
