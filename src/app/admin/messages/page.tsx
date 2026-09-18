import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  Inbox, 
  ArrowLeft, 
  Mail, 
  ShieldAlert, 
  Clock, 
  User, 
  Bug, 
  Sparkles, 
  RefreshCw, 
  HelpCircle 
} from "lucide-react";

export default async function AdminMessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userEmail = session.user.email?.toLowerCase() || "";
  const username = ((session.user as any)?.username || session.user.name || "").toLowerCase();

  // Admin access validation
  const isAdmin = userEmail === "arpitsingh8534@gmail.com" || username === "arp1t";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-border/80 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold">Admin Access Required</h1>
          <p className="text-sm text-muted-foreground">
            This inbox is restricted to administrators. If you believe this is an error, please log in with your admin credentials.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground font-semibold text-xs hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Fetch all contact messages
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case "bug":
        return {
          icon: <Bug className="w-3 h-3 text-red-500" />,
          label: "Bug Report",
          className: "bg-red-500/10 text-red-500 border-red-500/20",
        };
      case "feature":
        return {
          icon: <Sparkles className="w-3 h-3 text-emerald-500" />,
          label: "Feature Request",
          className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        };
      case "sync":
        return {
          icon: <RefreshCw className="w-3 h-3 text-sky-500" />,
          label: "Sync Issue",
          className: "bg-sky-500/10 text-sky-500 border-sky-500/20",
        };
      default:
        return {
          icon: <HelpCircle className="w-3 h-3 text-amber-500" />,
          label: "General Inquiry",
          className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        };
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">Support Inbox</h1>
                <p className="text-xs text-muted-foreground">
                  Review contact submissions delivered to your platform ({messages.length} total)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Admin: {session.user.name || "Arpit"}
            </span>
          </div>
        </div>

        {/* Message List */}
        {messages.length === 0 ? (
          <div className="p-12 rounded-2xl bg-card/60 border border-border/60 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold">No messages yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              When users submit issues or questions via the "Contact for Help" option, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const badge = getCategoryBadge(msg.category);
              const formattedDate = new Date(msg.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={msg.id}
                  className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-border transition-all space-y-3.5"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${badge.className}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                      <h2 className="text-base font-bold text-foreground">
                        {msg.subject}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/40 text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed font-sans">
                    {msg.message}
                  </div>

                  {/* Sender and Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/40 text-xs text-muted-foreground">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span className="font-medium text-foreground">{msg.name || "Anonymous"}</span>
                      </div>
                      
                      {msg.email && (
                        <a
                          href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                          className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                        >
                          <Mail className="w-3 h-3" />
                          {msg.email}
                        </a>
                      )}

                      {msg.ipAddress && (
                        <span className="text-[10px] text-muted-foreground/70">
                          IP: {msg.ipAddress}
                        </span>
                      )}
                    </div>

                    {msg.email && (
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all active:scale-[0.98]"
                      >
                        <Mail className="w-3 h-3" /> Reply by Email
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
