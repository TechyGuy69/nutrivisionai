# NutriVision AI

NutriVision AI is a modern nutrition companion built with Next.js, Firebase, and Google Gemini.

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies:** `npm install`
3. **Set up local environment variables:**
   Create a `.env` file in the root directory and add:
   ```env
   GEMINI_API_KEY=your_gemini_key
   SPOONACULAR_API_KEY=your_spoonacular_key
   USDA_API_KEY=your_usda_key_optional
   ```
4. **Run development server:** `npm run dev`

## 🛠 Deployment & API Keys

**CRITICAL:** Never commit your API keys to GitHub. Your local `.env` file is ignored by git. For production, you must set these keys in your hosting environment.

### Adding API Keys in Firebase App Hosting (Production)

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project and navigate to **App Hosting**.
3. Select your backend and click on the **Settings** tab.
4. Go to **Environment Variables**.
5. Add the following keys:
   - `GEMINI_API_KEY`
   - `SPOONACULAR_API_KEY`
   - `USDA_API_KEY` (if applicable)
6. Click **Save**. You may need to trigger a new rollout for changes to take effect.

### Adding Secrets on GitHub (for Actions/CI)

If you use GitHub Actions for automated tasks, add your keys under **Settings > Secrets and variables > Actions** in your GitHub repository. Note that these are separate from the runtime environment variables in Firebase.

## 📱 Features

- **Food Data Explorer:** Search for nutritional facts.
- **Visual Food Recognition:** Analyze meals from photos.
- **Recipe Crafter:** Generate recipes from ingredients.
- **AI Healthy Meal Coach:** Chat for personalized advice.
