'use client';

import { useState, useEffect, useId } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Mail, 
  Bug, 
  Lightbulb, 
  RefreshCw, 
  MessageSquare, 
  ExternalLink 
} from 'lucide-react';

export interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: 'bug' | 'feature' | 'sync' | 'general';
  userName?: string | null;
  userEmail?: string | null;
  leetcodeUsername?: string | null;
}

const CATEGORIES = [
  { id: 'bug', label: 'Bug Report', icon: Bug, desc: 'Something is broken or not working as expected' },
  { id: 'sync', label: 'Sync Issue', icon: RefreshCw, desc: 'Trouble connecting or syncing LeetCode problems' },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb, desc: 'Suggest a new algorithm, tool, or improvement' },
  { id: 'general', label: 'General Help', icon: MessageSquare, desc: 'General question, feedback, or assistance' },
] as const;

export function ContactModal({
  isOpen,
  onClose,
  defaultCategory = 'general',
  userName,
  userEmail,
  leetcodeUsername,
}: ContactModalProps) {
  const [category, setCategory] = useState<'bug' | 'feature' | 'sync' | 'general'>(defaultCategory);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState(userName || '');
  const [senderEmail, setSenderEmail] = useState(userEmail || '');
  const [honeypot, setHoneypot] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Sync props
  useEffect(() => {
    if (userName) setSenderName(userName);
    if (userEmail) setSenderEmail(userEmail);
  }, [userName, userEmail]);

  // Check client-side cooldown on open
  useEffect(() => {
    if (!isOpen) return;

    const checkCooldown = () => {
      const lastSent = localStorage.getItem('last_contact_submission_ts');
      if (lastSent) {
        const elapsed = Math.floor((Date.now() - parseInt(lastSent, 10)) / 1000);
        const remaining = 60 - elapsed;
        if (remaining > 0) {
          setCooldownRemaining(remaining);
        } else {
          setCooldownRemaining(0);
        }
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownRemaining > 0) return;

    setErrorMsg(null);

    // Client validation
    if (subject.trim().length < 3) {
      setErrorMsg('Please enter a descriptive subject (at least 3 characters).');
      return;
    }

    if (message.trim().length < 15) {
      setErrorMsg('Please enter a detailed message (at least 15 characters) so we can help.');
      return;
    }

    if (message.trim().length > 1500) {
      setErrorMsg('Message is too long (maximum 1,500 characters).');
      return;
    }

    setLoading(true);

    try {
      // Append debug context if available
      let detailedMessage = message.trim();
      if (leetcodeUsername) {
        detailedMessage += `\n\n---\nDiagnostic Context:\n- LeetCode User: ${leetcodeUsername}\n- Client Time: ${new Date().toISOString()}`;
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          subject: subject.trim(),
          message: detailedMessage,
          website_hp: honeypot, // Anti-bot honeypot
          senderName: senderName.trim(),
          senderEmail: senderEmail.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit message.');
      }

      // Record cooldown
      localStorage.setItem('last_contact_submission_ts', Date.now().toString());
      setCooldownRemaining(60);
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setSubject('');
    setMessage('');
    setErrorMsg(null);
  };

  const mailtoLink = `mailto:arpitsingh8534@gmail.com?subject=${encodeURIComponent(`[LeetCode FSRS - ${category.toUpperCase()}] ${subject || 'Help Request'}`)}&body=${encodeURIComponent(`Hi Arpit,\n\n${message || 'I need help with...'}\n\nFrom: ${senderName || 'User'} (${senderEmail || 'No email'})\nLeetCode: ${leetcodeUsername || 'N/A'}`)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-foreground">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/60 bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 id="contact-modal-title" className="text-lg font-bold tracking-tight">
                Contact for Help
              </h3>
              <p className="text-xs text-muted-foreground">
                Get in touch directly with Arpit for bugs, features, or sync support
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {success ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-foreground">Message Delivered!</h4>
              <p className="text-sm text-muted-foreground max-w-md">
                Thank you for getting in touch. Your message has been safely received, and Arpit will review it promptly.
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={cooldownRemaining > 0}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border/60 transition-all disabled:opacity-50"
                >
                  {cooldownRemaining > 0 ? `Send another (${cooldownRemaining}s)` : 'Send another message'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Topic / Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-foreground shadow-xs'
                            : 'bg-secondary/20 hover:bg-secondary/50 border-border/60 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <div className="text-xs font-bold">{cat.label}</div>
                          <div className="text-[11px] opacity-70 leading-tight line-clamp-1">{cat.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sender info preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Arpit"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-secondary/30 border border-border/70 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Your Email (for response)
                  </label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="e.g. yourname@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-secondary/30 border border-border/70 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Subject <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summary of your question or issue"
                  maxLength={100}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-secondary/30 border border-border/70 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <span className={`text-[11px] ${message.length > 1400 ? 'text-amber-500 font-bold' : 'text-muted-foreground'}`}>
                    {message.length} / 1500
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or feedback in detail (at least 15 characters)..."
                  minLength={15}
                  maxLength={1500}
                  className="w-full p-3 text-sm rounded-xl bg-secondary/30 border border-border/70 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
                />
              </div>

              {/* Anti-bot Honeypot input (Hidden from real users) */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <label htmlFor="website_hp">Leave this empty</label>
                <input
                  id="website_hp"
                  name="website_hp"
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Error display */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Anti-spam note & Rate limit indicator */}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground p-2.5 rounded-xl bg-secondary/20 border border-border/40">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Spam protected (max 3 messages / hr)</span>
                </div>
                {cooldownRemaining > 0 ? (
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Cooldown: {cooldownRemaining}s</span>
                  </div>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ready to send</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <a
                  href={mailtoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  title="Open in your default email client"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Send via Email app
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 text-xs font-medium rounded-xl border border-border/70 hover:bg-secondary/60 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || cooldownRemaining > 0}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Sending...
                      </>
                    ) : cooldownRemaining > 0 ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        Wait {cooldownRemaining}s
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
