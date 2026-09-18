# 🚀 LeetCode Spaced Repetition (FSRS) Tracker

![Dashboard Snapshot](public/dashboard-snapshot.png)

A high-performance web application engineered to transform technical interview preparation. This platform combines the mathematical precision of the **Free Spaced Repetition Scheduler (FSRS-6)** with your daily LeetCode practice, ensuring you review algorithmic problems at the exact moment of optimal memory consolidation.

🌐 **Live Application:** [https://leetcode-practice-tracker.vercel.app/](https://leetcode-practice-tracker.vercel.app/)  
📂 **Repository:** [https://github.com/Arp1tSingh/Leetcode-Practice-Tracker](https://github.com/Arp1tSingh/Leetcode-Practice-Tracker)

---

## 🧠 Core Philosophy & Algorithm

Traditional LeetCode practice relies on brute-force repetition or arbitrary review intervals (e.g., 1 day, 3 days, 1 week), causing either burnout or memory decay. This application uses **FSRS-6** (`ts-fsrs`), an advanced spaced repetition model that models human memory as a function of **Stability ($S$)** and **Difficulty ($D$)**.

### Retrievability Decay Formula
Memory retrievability $R(t)$ represents the probability of recalling a problem $t$ days after the last review:
$$R(t) = \exp\left(\ln(0.9) \times \frac{t}{S}\right)$$

- **Optimal Interval Calculation:** Reviews are scheduled when retention drops near target recall (90%).
- **Multi-Factor Feedback:** Performance grading (**Again**, **Hard**, **Good**, **Easy**) dynamically updates stability and difficulty factors.
- **Continuous Calibration:** Problem difficulty weights adjust based on whether hints were needed, time taken, and pattern recognition.

---

## ✨ Key Features

### 1. 🛡️ Paced Review Queue & Cold-Start Overload Protection
Importing hundreds of existing solved problems typically floods users with an overwhelming Day-1 backlog. We solved this with a **paced review queue architecture**:
- **Daily Review Target:** Enforces a manageable daily quota (default: **6 cards**, customizable to 4, 6, 8, 10, or 15 via interactive presets).
- **Urgency-Ranked Sorting:** Cards are sorted by mathematical urgency—prioritizing problems with the lowest retrievability $R(t)$ (most forgotten) first.
- **Historical Import Calibration:**
  - 🌟 **Confident (Paced):** Imported problems start with higher stability; initial reviews are pushed out 8–15 days to eliminate day-one fatigue.
  - 🎯 **Need Practice (Immediate):** Problems start with immediate due dates for rapid reinforcement.
- **Backlog Management:** Displays a calm *"X additional cards resting in backlog"* badge with an on-demand *"Review +3 more from backlog"* button.
- **Real-Time Progress:** Animated gradient progress bar tracking daily completion goals.

### 2. ⚡ Multi-Channel LeetCode Sync
- **Automated Background Sync:** Silently checks for your latest accepted submissions upon visiting the dashboard (safeguarded with a 15-minute cooldown).
- **Public Profile Sync:** One-click manual sync for immediate problem ingestion.
- **1-Click Bookmarklet:** Drag our custom JavaScript bookmarklet to your browser bar. Clicking it while logged into `leetcode.com` imports your entire solved history via a secure, stateless JWT exchange.

### 3. 📄 Smart CSV Bulk Import & Template Generator
- **Universal Column Detection:** Intelligently maps column headers regardless of casing or formatting (`Problem ID`, `id`, `questionId`, `frontend_question_id`, `#`).
- **Rich Metadata Fast-Path:** If your CSV provides problem names, difficulty, and patterns (such as Excel exports), the system uses an atomic database batch insert in **under 1 second**, completely bypassing external API lookups.
- **In-App Format Guide:** Built-in interactive reference table with column requirements and examples.
- **1-Click Sample CSV Download:** Direct download button for `leetcode_import_template.csv` to ensure seamless imports.

### 4. 🧩 Pattern Mastery & Taxonomy
- Groups problems across primary algorithmic patterns (e.g., *Sliding Window*, *Two Pointers*, *Fast & Slow Pointers*, *Graph BFS/DFS*, *Dynamic Programming*).
- Highlights retention health per pattern so you can target weak algorithmic foundations before interviews.

### 5. 📖 Dedicated "How to Use" Guide (`/how-to-use`)
- Beginner-friendly onboarding guide explaining the FSRS system, grading definitions, calibration strategies, and daily queue pacing in clear, jargon-free language.

### 6. 📬 In-App Support & Free Email Dispatch
- **Anti-Spam Safeguards:** Multi-tier rate limiting (max 3 messages/hr, 45s cooldown, invisible honeypot bot trap, 15-minute duplicate payload hashing).
- **Email Forwarding (Resend):** Free email dispatch delivering contact submissions directly to developer Gmail (`onboarding@resend.dev`) with native `replyTo` support.
- **Discord Webhooks:** Optional instant mobile notifications via Discord embed webhooks.
- **Admin Support Inbox (`/admin/messages`):** Restricted dashboard view for administrators to review, search, and manage incoming user feedback directly inside the app.

### 7. 🌐 Web Standards, SEO & Accessibility
- Complete SEO configuration with `robots.txt`, dynamic `sitemap.xml`, and social Open Graph banners (`/opengraph-image`).
- Custom 404 handler (`/_not-found`), Privacy Policy (`/privacy`), Terms of Service (`/terms`), and Cookie consent banner.
- Fully viewport-safe modal dialogs mounted to `document.body` via React Portals with background scroll locking.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Spaced Repetition** | [ts-fsrs v5.4](https://github.com/open-spaced-repetition/ts-fsrs) (FSRS-6 algorithm) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) on [Supabase](https://supabase.com/) via [Prisma ORM 5](https://www.prisma.io/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with curated glassmorphism & dark/light themes |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) (Credentials & OAuth Session Management) |
| **Email Dispatch** | [Resend](https://resend.com/) SDK (Free Tier) |
| **Data Parsing** | [PapaParse](https://www.papaparse.com/) (Streaming client-side CSV parsing) |
| **Icons & Primitives** | [Lucide React](https://lucide.dev/), [Base UI](https://base-ui.com/) |

---

## 💻 Running Locally

### 1. Prerequisites
- **Node.js** (v20+ recommended)
- **npm** or **pnpm**
- A **PostgreSQL** database (e.g. local PostgreSQL, Supabase, or Neon)

### 2. Clone the Repository
```bash
git clone https://github.com/Arp1tSingh/Leetcode-Practice-Tracker.git
cd Leetcode-Practice-Tracker/leetcode-app
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in `leetcode-app/` with the following keys:

```env
# Database Connections (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-nextauth-secret"

# Free Email Dispatch (Resend - Optional)
# Get a free key at https://resend.com (100 emails/day, no credit card required)
RESEND_API_KEY="re_your_api_key_here"
CONTACT_RECEIVER_EMAIL="your-email@gmail.com"
RESEND_FROM_EMAIL="LeetCode Repetition <onboarding@resend.dev>"

# Optional: Instant Discord Webhook Notifications
# DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
```

### 5. Initialize the Database
Push the Prisma schema to your database and generate the Prisma client:
```bash
npx prisma db push
npx prisma generate
```

### 6. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ Upcoming Roadmap

Tracked in [`next features.txt`](../next%20features.txt):
- [ ] **Advanced Analytics & Heatmaps 📊**
  - **Contribution Heatmap:** GitHub/LeetCode-style green activity grid tracking review consistency over the year.
  - **Future Workload Forecast:** 14-day forward bar chart forecasting upcoming review density to help plan your study load.
  - **Retention Tracking Graph:** Historical retention rate tracking validating that the FSRS-6 algorithm is maintaining target recall (90%).

---

## 📄 License & Author

Created and maintained by **[Arpit Singh](https://github.com/Arp1tSingh)**.  
Distributed under the MIT License. Feel free to use, modify, and contribute!
