# EcoSave Express

EcoSave Express is a full-stack, money-first carbon footprint awareness web application designed for Indian households. It teaches users how to identify utility waste, lower their monthly bills, and calculate their real carbon footprint offsets, with all recommendations and chat logs processed by Google's Gemini API.

---

## Key Features

1. **Bill Intelligence**: Upload electricity bill images or enter units manually. Gemini processes the bill, extracts usage stats, calculates carbon volumes (~0.82 kg CO₂/kWh grid factor), and offers 3 tailored recommendations with exact rupee savings.
2. **Interactive Room Auditor**: A premium visual room selector (Living Room, Kitchen, Bedroom, Outdoor Balcony) showing color-coded consumption levels, specific appliance loads, and energy conservation action items.
3. **Travel Carbon Tracker**: Enter trip parameters to calculate fuel/transit carbon footprints and receive Gemini alternative public transit or EV routing comparisons. Shows an animated neon route line on an SVG city map!
4. **Leakage Chatbot (Boond)**: Chat in Hinglish with Boond, our friendly water drop mascot. Boond analyzes leakage descriptions, provides conversational solutions, and calculates estimated water and rupee waste metrics.
5. **Impact Mirror**: Translates abstract carbon kilograms into concrete Indian household analogies (e.g. neem saplings, ceiling fan hours, LPG cylinder days, mobile charges) and scales it to a 500-household community multiplier.
6. **Rewards Center**: Dynamic Leaderboard ranking user achievements, EcoCoins tracking based on logged savings, and Web Share API integration to post impact cards.

---

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS v4 + Lucide Icons + Recharts
- **Backend**: Node.js + Express + Multer (OCR bill uploads)
- **Database**: File-backed atomic JSON database (`server/db/database.json`)
- **AI Engine**: Google Gemini API (`gemini-1.5-flash`)

---

## Installation & Setup

### 1. Prerequisites
- **Node.js**: Ensure you have Node.js (v18+) installed on your machine.

### 2. Configure Environment variables
1. In the root directory, create a `.env` file (you can copy `.env.example` as a starting point):
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and add your Google Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```
   *Note: If the key is omitted or invalid, the application runs in fallback local mode using rules-based calculations so you can still test it offline.*

### 3. Install Dependencies
Install all package dependencies for both React frontend and Express backend at the root directory:
```bash
npm install
```

### 4. Running the Application

#### Development Mode (Concurrent)
Launch both the Vite development client and Express backend server in a single terminal session:
```bash
npm run dev
```
The React client runs on [http://localhost:5173](http://localhost:5173) and proxies API endpoints to the Express backend running on [http://localhost:5000](http://localhost:5000).

#### Production Build & Run
Compile the frontend static assets and host the application entirely from the Node.js server:
```bash
# 1. Build the React production files
npm run build

# 2. Start the Express server hosting the build files
npm run start
```
Go to [http://localhost:5000](http://localhost:5000) to view the live production build.

---

## Evaluation Flow & Testing

1. **Check-ins**: Complete a daily habit check-in under the **Streak Tracker** to increase your EcoScore.
2. **Bill Scan**: Go to **Electricity**, upload a sample bill image or choose manual entry to extract savings.
3. **Route Planner**: Go to **Travel**, enter an origin and destination (e.g. "Colaba" to "Andheri") with travel parameters and check the animated map.
4. **Chat with Boond**: Ask Boond about water leaks in Hinglish (e.g. *"Nal se paani continuously tapak raha hai, aur flush leak hai"*).
5. **Impact Mirror**: Visit the **Impact Mirror** page to see your savings scaled to a community.
6. **Share & Ranks**: Review your ranking on the leaderboard in the **Rewards Center** and click **Share Achievements** to copy your stats card.
