# NutriVision AI

NutriVision AI is a modern nutrition companion built with Next.js, Firebase, and Google Gemini.

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies:** `npm install`
3. **Set up local environment variables:**
   Create a `.env` file in the root directory and add:
   ```env
   GEMINI_API_KEY=your_gemini_key
   SPOONACULAR_API_KEY=cb09c4d7c0364491982ce2ac2d0463c4
   USDA_API_KEY=your_usda_key_optional
   ```
4. **Run development server:** `npm run dev`

## 🛠 Deployment & API Keys

When you publish to GitHub and deploy to **Firebase App Hosting**, your local `.env` file is not uploaded. You must add your API keys in the deployment dashboard.

### Adding API Keys in Firebase App Hosting

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project and navigate to **App Hosting**.
3. Select your backend and click on the **Settings** tab.
4. Go to **Environment Variables**.
5. Add the following keys:
   - `GEMINI_API_KEY`
   - `SPOONACULAR_API_KEY`
   - `USDA_API_KEY` (if applicable)
6. Click **Save**. You may need to trigger a new rollout for changes to take effect.

### Adding Secrets on GitHub (for Actions)

If you are using GitHub Actions for CI/CD:
1. Navigate to your repository on GitHub.
2. Click **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret**.
4. Add your keys here. Note that these are typically for build-time secrets; runtime secrets should be managed in your hosting provider's dashboard.

## 📱 Features

- **Food Data Explorer:** Search for nutritional facts.
- **Visual Food Recognition:** Analyze meals from photos.
- **Recipe Crafter:** Generate recipes from ingredients.
- **AI Healthy Meal Coach:** Chat for personalized advice.
