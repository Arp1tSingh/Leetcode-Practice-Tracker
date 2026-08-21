# LeetCode Spaced Repetition (FSRS) Tracker

![Dashboard Snapshot](public/favicon.ico) <!-- Placeholder for actual screenshot -->

A powerful web application designed to supercharge your technical interview prep. This app brings the science of **Spaced Repetition (FSRS)** to your LeetCode grind, ensuring that you review problems exactly when you're about to forget them. 

🌐 **Live Demo:** [https://leetcode-practice-tracker.vercel.app/](https://leetcode-practice-tracker.vercel.app/)

---

## 🧠 How it Works

1. **Intelligent Scheduling:** We utilize the Free Spaced Repetition Scheduler (FSRS) algorithm. When you review a problem and grade your performance (e.g., Easy, Medium, Hard, Again), the engine calculates your memory retention and schedules the next review day to optimize mastery.
2. **Seamless LeetCode Sync:** Connect your public LeetCode username. The app automatically fetches your most recent accepted submissions via the LeetCode GraphQL API and adds them to your tracker. No manual data entry required!
3. **Pattern Mastery:** Group and track your proficiency across fundamental algorithm patterns (Sliding Window, Two Pointers, DP, etc.).
4. **Daily Queue:** Your dashboard provides a tailored "Today's Recommended Queue" so you always know exactly which problems need your attention on any given day.

---

## 🛠️ Tech Stack

This project is built using modern web development standards to ensure a fast, responsive, and sleek user experience:

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Language:** [TypeScript](https://www.typescriptlang.org/) for robust type safety.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a custom glassmorphic UI and curated dark/light modes.
- **Database ORM:** [Prisma](https://www.prisma.io/) to securely manage user data, problems, and review logs.
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) configured for secure Google OAuth sign-in.
- **Icons & UI:** [Lucide React](https://lucide.dev/) and Radix UI primitives.

---

## 🚀 Running Locally

Want to run this project on your own machine? Follow these steps:

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (or any other relational database supported by Prisma)
- A Google Cloud Console project (for OAuth credentials)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/leetcode-practice-tracker.git
cd leetcode-practice-tracker
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```env
# Database connection string (Prisma)
DATABASE_URL="postgresql://user:password@localhost:5432/leetcode_fsrs"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-key-here"

# Google OAuth Credentials (for sign in)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 5. Initialize the Database
Run Prisma to push the schema to your database and generate the local client:
```bash
npx prisma db push
npx prisma generate
```

### 6. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app running.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
