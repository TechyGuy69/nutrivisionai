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
- **Deployment:** Vercel / Firebase App Hosting

## 🏗 Architecture & Features

### 1. Visual Food Recognition
Uses **Gemini 2.5 Flash** to analyze uploaded photos. It identifies the food item and estimates calories, protein, carbs, and fats directly from pixels.

### 2. Food Data Explorer
An AI-powered search engine that queries a vast nutritional database. It uses a hybrid approach:
- **Primary:** USDA FoodData Central API (if configured).
- **Secondary:** Gemini 2.5 Flash for expert estimation on cooked dishes and complex meals.

### 3. AI Recipe Crafter
Generates personalized recipes based on ingredients you have in your fridge. It respects dietary preferences (Vegan, Keto, etc.) and provides step-by-step instructions.

### 4. AI Healthy Meal Coach
A conversational agent trained as a professional nutritionist. It answers questions about diet, suggests healthier alternatives, and provides encouraging feedback.

### 5. Personalization & History
- **Profiles:** Onboarding flow to capture goals and allergies.
- **Activity History:** Automatically logs every scan and recipe.
- **Favorites:** One-click bookmarking of food items from search results or detail pages.

## 📱 Getting Started

1. **Clone the repository**
2. **Install dependencies:** `npm install`
3. **Set up environment variables:**
   Create a `.env` file with:
   ```env
   GEMINI_API_KEY=your_key
   SPOONACULAR_API_KEY=your_key (for food images)
   USDA_API_KEY=your_key (optional)
   ```
4. **Run development:** `npm run dev`

## 🛠 Production Deployment (Vercel/Firebase)

**CRITICAL:** In production, you must add `GEMINI_API_KEY` to your environment variables in your hosting dashboard (Vercel Settings or Firebase App Hosting Settings). Without this, AI features will fail.
