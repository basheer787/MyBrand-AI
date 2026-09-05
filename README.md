# MyBrand AI — Full-Stack AI Branding & Growth Studio

> An intelligent, full-stack branding and marketing platform that transforms raw business details and photos into consistent visual brand identities, 7-day multi-channel social calendars, and high-converting sales copy.

![Next.js](https://img.shields.io/badge/Next.js-16.3.2-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ecf8e?style=for-the-badge&logo=supabase)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-Multimodal%20AI-8e75ff?style=for-the-badge&logo=google)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)

---

## 📌 Overview

Small business owners often struggle to maintain consistent visual identity, compelling copy, and regular social media marketing across multiple platforms. 

**MyBrand AI** solves this by generating a comprehensive **Brand DNA system** grounded in the business's real images and questionnaire context. By leveraging **Retrieval-Augmented Generation (RAG)** and a continuous performance feedback loop, every generated campaign improves over time while staying 100% faithful to the brand's voice and color harmony.

---

## ✨ Core Features

### 1. 🎨 Visual Brand Kit & Brand DNA
* **Harmonious Color Palettes**: 5 complementary HEX colors with 1-click clipboard copy.
* **Typography Recommendations**: Font pairings (Headline vs. Body) with live rendered previews.
* **Brand Tone & Voice**: Defined brand voice guidelines for all future content.
* **Core Value Pillars**: 4 value-proposition messaging pillars.
* **Logo Direction & Variations**: Minimalist concept descriptions and structured variation ideas (monogram, horizontal lockup, icon badge).

### 2. 📅 7-Day Multi-Channel Content Calendar
* Exactly 7 ready-to-publish posts distributed across:
  * 📸 **Instagram**
  * 💼 **LinkedIn**
  * 🎵 **TikTok**
  * ✉️ **Email Nurture**
  * 🎯 **Google Ads**
  * 📱 **Facebook Ads**
* Each post includes:
  * **Day & Platform Badge**
  * **Engaging Caption with Hashtags**
  * **AI Image Generation Prompt**
  * **High-Intent Call-to-Action (CTA)**
  * **1-Click Copy Buttons**

### 3. ✍️ Sales & Conversion Copy Engine
* **Landing Page Headline & Subhead**: High-converting hero copy.
* **Core Product / Service Descriptions**: Elevator pitches and service overviews.
* **High-Intent Google Ads Copy**: Headline + description.
* **High-Converting Meta / Facebook Ads**: Hook, body text, and CTA.
* **Viral TikTok Script**: Hook & 15-second outline.
* **Short-Form Video Script**: 30-second Reel/Short storyboard.
* **3-Part Email Welcome Sequence**: Welcome, Value/Education, and Special Offer emails.

### 4. 📈 Continuous RAG Performance Feedback Loop
* Log real marketing metrics: **Impressions/Views**, **Clicks**, **Conversions**, **Engagement Rate %**, and **Learnings Notes**.
* One-click **"↻ Regenerate with Feedback"** sends historical metrics to Gemini to iteratively refine future campaigns.

### 5. 🚀 Social Media Publishing (Meta Integration)
* Connect Facebook Pages and linked Instagram Business accounts via the official Meta Graph API.
* Select an uploaded brand asset and publish directly from the 7-day calendar.

---

## 🏗️ System Architecture

```
                      [ Business Owner ]
                              │
                              ▼
        [ Next.js 16 Web Application on Vercel ]
         ├─ Tailwind CSS 4 UI & Plus Jakarta Sans
         ├─ 4-Step Interactive Creation Wizard
         └─ Private User Workspace Hub
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
       [ Supabase Cloud ]           [ Google Gemini AI ]
        ├─ Auth (User Sessions)      ├─ Multimodal Image Analysis
        ├─ PostgreSQL Database       ├─ Structured JSON Generation
        ├─ pgvector (768-dim RAG)    └─ Dynamic Strategy Fallback
        └─ Private Image Storage
```

---

## 🧠 How RAG (Retrieval-Augmented Generation) Works

```
           [ "Create New Campaign" ]
                      │
                      ▼
┌────────────────────────────────────────────────────────┐
│ 1. RETRIEVE from Supabase                              │
│   • Business Questionnaire (Type, Location, Audience)  │
│   • Brand DNA (Stored voice, colors, logo rules)       │
│   • Uploaded Photos (Downloaded from private storage)  │
│   • Performance Feedback History (Metrics & notes)     │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────┐
│ 2. AUGMENT Gemini Prompt                               │
│   Injects retrieved business context, past winning     │
│   metrics, and base64 image data into the prompt.      │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────┐
│ 3. GENERATE Grounded Brand Kit & Multi-Channel Plan    │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
[ Save back to Supabase + Vector Embeddings for future retrieval ]
```

---

## 📁 Project Directory Structure

```text
mybrand-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Main dashboard & demo preview
│   │   ├── layout.tsx                    # Root layout with Plus Jakarta Sans
│   │   ├── globals.css                   # Design tokens, buttons, glassmorphism
│   │   ├── auth/page.tsx                 # Signup & login with Supabase
│   │   ├── create/page.tsx               # 4-step brand creation wizard
│   │   ├── workspace/page.tsx            # Saved brands portfolio
│   │   ├── workspace/[brandId]/page.tsx  # Brand hub (Kit, Calendar, Copy, Feedback)
│   │   └── api/
│   │       ├── generate/route.ts         # Secure server-side Gemini generation
│   │       ├── publish/meta/route.ts     # Meta Instagram/FB publishing API
│   │       └── auth/meta/                # OAuth callback & start routes
│   │
│   ├── components/
│   │   ├── Shell.tsx                     # Responsive layout sidebar shell
│   │   ├── BrandOutput.tsx               # Brand Kit, Calendar & Sales Copy views
│   │   ├── FeedbackForm.tsx              # Performance feedback logger
│   │   └── PublishPanel.tsx              # Meta publishing & audit log
│   │
│   └── lib/
│       ├── types.ts                      # TypeScript definitions & schemas
│       ├── meta.ts                       # Meta Graph API utilities
│       └── supabase/
│           ├── client.ts                 # Browser Supabase client
│           └── server.ts                 # Server-side Supabase client
│
├── supabase/
│   ├── schema.sql                        # Core DB tables, RLS policies, storage bucket
│   ├── social.sql                        # Social connections & publications schema
│   └── upgrade.sql                       # Performance feedback upgrade script
│
├── .env.example                          # Safe environment variable template
├── .env.local                            # Local private secrets (never commit)
├── next.config.ts                        # Next.js configuration
├── tsconfig.json                         # TypeScript configuration
└── package.json                          # Dependencies & scripts
```

---

## 🗄️ Database Structure & Security

Supabase PostgreSQL with **Row Level Security (RLS)** ensures complete data privacy:

| Table | Purpose | Security Policy |
| :--- | :--- | :--- |
| **`brands`** | Stores business profiles, questionnaire data, and Brand DNA. | `auth.uid() = user_id` |
| **`assets`** | Metadata and storage paths for uploaded photos. | Relational check on brand owner |
| **`generations`** | Saves generated Brand Kits, calendars, and sales copy. | Relational check on brand owner |
| **`performance_feedback`**| User-logged campaign metrics and strategic notes. | Relational check on brand owner |
| **`social_connections`** | Encrypted Meta OAuth page and Instagram tokens. | Relational check on brand owner |
| **`publications`** | History and status of posts sent to Meta APIs. | Relational check on brand owner |
| **`brand-assets` (Storage)** | Private image bucket with signed URL retrieval. | Restricted by `auth.uid()` path prefix |

---

## 🚀 Getting Started Locally

### 1. Prerequisites
* **Node.js** (v18.x or v20.x recommended)
* **npm** or **yarn**
* Free accounts on **[Supabase](https://supabase.com)** and **[Google AI Studio](https://aistudio.google.com)**

### 2. Clone the Repository
```bash
git clone https://github.com/basheer787/MyBrand-AI.git
cd MyBrand-AI/mybrand-ai
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup (Supabase)
1. In your Supabase project, open the **SQL Editor**.
2. Run the SQL scripts in order:
   - [`supabase/schema.sql`](supabase/schema.sql)
   - [`supabase/social.sql`](supabase/social.sql)

### 5. Configure Environment Variables
Create a `.env.local` file inside the `mybrand-ai` directory:

```env
# 1. Google Gemini AI Key (Server-Side)
GEMINI_API_KEY=your_gemini_api_key_from_ai_studio

# 2. Supabase Credentials (from Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# 3. Optional: Meta Graph API (Instagram & Facebook Publishing)
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
```

### 6. Run the Local Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🚢 Deploying to Vercel

1. Push your repository to GitHub.
2. Go to **[Vercel Dashboard](https://vercel.com/new)** and import your `MyBrand-AI` repository.
3. If the Next.js app is inside the `mybrand-ai` subfolder, set **Root Directory** to `mybrand-ai`.
4. Add your **Environment Variables** in Vercel settings:
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. Click **Deploy**.

---

## 🔒 Security Best Practices
* **Zero Client-Side Secret Exposure**: `GEMINI_API_KEY` and `META_APP_SECRET` run strictly on the Next.js server route.
* **Row Level Security (RLS)**: Enforced on all tables — User A can never read or modify User B's brands or assets.
* **Private Storage**: Business photos are stored in a private bucket accessible only through temporary signed URLs.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
