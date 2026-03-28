# NutriVision AI

NutriVision AI is a high-performance nutrition companion built with Next.js 15, Firebase, and Google's Gemini 2.5 Flash. It provides visual food recognition, structured nutritional data exploration, and personalized AI coaching.

## 🚀 Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **AI Engine:** [Google Genkit](https://github.com/firebase/genkit)
- **AI Model:** **Gemini 2.5 Flash** (Multimodal: Text, Vision, Reasoning)
- **Database:** [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth) (Anonymous Sign-in)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🏗 System Architecture

NutriVision AI follows a modern, serverless architecture optimized for speed and AI integration:

### 1. Presentation Layer (Frontend)
- **React 19 & Next.js 15:** Utilizes the App Router for efficient rendering and streaming.
- **Client-Side Firebase SDK:** Directly interacts with Firestore for real-time updates (Favorites, History) and manages Auth state.
- **Shadcn UI:** Provides a consistent, accessible, and professional interface.

### 2. Logic Layer (AI & API)
- **Genkit Flows (Server Actions):** Encapsulates complex AI logic in secure, server-side functions.
- **Gemini 2.5 Flash:** Acts as the "Brain" for vision analysis, recipe reasoning, and conversational coaching.
- **Hybrid Search Engine:** Combines structured API data with AI inference.

### 3. Data Layer (Persistence)
- **Firebase Auth:** Handles anonymous sessions for immediate user access.
- **Cloud Firestore:** Stores User Profiles, Activity Logs, and curated Favorites.

## 🛠 Services & Integrations

### 1. Visual Food Recognition
Uses **Gemini 2.5 Flash** to analyze uploaded photos. It identifies the food item and estimates calories, protein, carbs, and fats directly from pixels.

### 2. Food Data Explorer
A multi-source search engine providing comprehensive nutritional facts:
- **Primary Service:** [USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide.html) (for verified lab data).
- **Secondary Service:** **Gemini 2.5 Flash** (for expert estimation of cooked dishes and restaurant meals).
- **Visual Service:** [Spoonacular API](https://spoonacular.com/food-api) (used to fetch relevant food images for search results).

### 3. AI Recipe Crafter
Generates personalized recipes based on ingredients using **Gemini 2.5 Flash**. It respects dietary preferences (Vegan, Keto, etc.) and provides step-by-step instructions.

### 4. AI Healthy Meal Coach
A conversational agent powered by **Gemini 2.5 Flash**, trained to provide professional nutritional advice and encouraging feedback.

## 📱 Getting Started

1. **Clone the repository**
2. **Install dependencies:** `npm install`
3. **Set up environment variables:**
   Create a `.env` file with:
   ```env
   GEMINI_API_KEY=your_key
   SPOONACULAR_API_KEY=your_key (for food images)
   USDA_API_KEY=your_key (for verified nutritional data)
   ```
4. **Run development:** `npm run dev`

## 🛠 Production Deployment (Vercel/Firebase)

**CRITICAL:** In production, you must add `GEMINI_API_KEY` to your environment variables in your hosting dashboard. Without this, AI features will fail.

© 2024 NutriVision AI. Empowering your health journey with artificial intelligence.