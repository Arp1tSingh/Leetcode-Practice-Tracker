import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendContactNotificationEmail } from "@/lib/email";

// In-memory rate limiting store: key -> list of timestamps
const rateLimitMap = new Map<string, number[]>();
const lastMessageHashMap = new Map<string, { hash: string; timestamp: number }>();

// Cleanup stale rate limit entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of rateLimitMap.entries()) {
    const valid = timestamps.filter(t => now - t < 3600000);
    if (valid.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, valid);
    }
  }
  for (const [key, data] of lastMessageHashMap.entries()) {
    if (now - data.timestamp > 1800000) {
      lastMessageHashMap.delete(key);
    }
  }
}, 600000);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || null;
    const userEmail = session?.user?.email || null;
    const userName = session?.user?.name || null;

    // Determine client IP for anti-abuse tracking
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : (realIp || "127.0.0.1");
    const rateLimitKey = userId ? `user:${userId}` : `ip:${clientIp}`;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const { category, subject, message, website_hp, senderName, senderEmail } = body;

    // 1. Honeypot check (hidden field that bots fill)
    if (website_hp && String(website_hp).trim().length > 0) {
      // Return 200 without saving to quietly drop bot spam
      return NextResponse.json({ success: true, message: "Message received." });
    }

    // 2. Input validation
    const validCategories = ["bug", "feature", "sync", "general"];
    const sanitizedCategory = validCategories.includes(category) ? category : "general";

    if (!subject || typeof subject !== "string" || subject.trim().length < 3 || subject.trim().length > 100) {
      return NextResponse.json(
        { error: "Subject must be between 3 and 100 characters." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 15 || message.trim().length > 1500) {
      return NextResponse.json(
        { error: "Message must be between 15 and 1,500 characters." },
        { status: 400 }
      );
    }

    // 3. Rate limiting safeguards (Max 3 messages per hour, min 45s between requests)
    const now = Date.now();
    const timestamps = rateLimitMap.get(rateLimitKey) || [];
    const recentOneHour = timestamps.filter(t => now - t < 3600000); // 1 hour window

    if (recentOneHour.length >= 3) {
      const oldestInHour = recentOneHour[0];
      const waitMinutes = Math.ceil((3600000 - (now - oldestInHour)) / 60000);
      return NextResponse.json(
        { error: `Too many submissions. To prevent spam, please wait ${waitMinutes} minute(s) before sending another message.` },
        { status: 429 }
      );
    }

    if (recentOneHour.length > 0) {
      const lastSent = recentOneHour[recentOneHour.length - 1];
      const elapsedSeconds = Math.floor((now - lastSent) / 1000);
      if (elapsedSeconds < 45) {
        const remaining = 45 - elapsedSeconds;
        return NextResponse.json(
          { error: `Please wait ${remaining} second(s) before sending another message.` },
          { status: 429 }
        );
      }
    }

    // 4. Duplicate message check
    const normalizedMessage = message.trim().toLowerCase();
    const lastHash = lastMessageHashMap.get(rateLimitKey);
    if (lastHash && lastHash.hash === normalizedMessage && now - lastHash.timestamp < 900000) {
      return NextResponse.json(
        { error: "Duplicate message detected. You have already sent this message recently." },
        { status: 400 }
      );
    }

    // 5. Save to database
    const finalName = (userName || senderName || "Anonymous").slice(0, 80);
    const finalEmail = (userEmail || senderEmail || null)?.slice(0, 100);

    const saved = await prisma.contactMessage.create({
      data: {
        userId,
        name: finalName,
        email: finalEmail,
        category: sanitizedCategory,
        subject: subject.trim(),
        message: message.trim(),
        ipAddress: clientIp,
      },
    });

    // Record rate limit timestamp and message hash
    recentOneHour.push(now);
    rateLimitMap.set(rateLimitKey, recentOneHour);
    lastMessageHashMap.set(rateLimitKey, { hash: normalizedMessage, timestamp: now });

    // 6. Dispatch Email Notification (Resend / Webhook)
    const emailResult = await sendContactNotificationEmail({
      id: saved.id,
      name: finalName,
      email: finalEmail,
      category: sanitizedCategory,
      subject: subject.trim(),
      message: message.trim(),
      clientIp,
      userId,
    });

    return NextResponse.json({
      success: true,
      id: saved.id,
      emailDispatched: emailResult.dispatched,
      message: "Your message has been sent successfully. We will review it shortly!",
    });
  } catch (error: any) {
    console.error("Error submitting contact message:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later or reach out via email." },
      { status: 500 }
    );
  }
}
