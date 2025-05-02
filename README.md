# AI Menu Package Generator

A web application that uses Google's Gemini AI to generate menu packages based on user preferences.

## Features

- Upload your menu as a PDF or image file
- AI-powered menu extraction using Google's Gemini Vision model
- Select your target audience (adults, kids, or family)
- AI-powered menu package generation with Gemini
- View recommended starters, main courses, and desserts
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd menu-package-generator
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your Gemini API key:

```
# Google Gemini API key for menu extraction and package generation
GEMINI_API_KEY=your_gemini_api_key_here
```

- Get a Google Gemini API key from: https://aistudio.google.com/app/apikey

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. On the first screen, upload your menu file (PDF, image, or text file)
2. The AI will process your menu and extract items with prices
3. Select your target audience (Adults, Kids, or Family)
4. Click "Generate Menu" to proceed
5. Review your menu items on the second screen
6. Click "Generate Package" to get AI recommendations
7. View your customized package with starters, main courses, and desserts

## Menu File Format

Your menu file should follow this format:
```
Caesar Salad - £8.99
Margherita Pizza - £12.99
Chocolate Cake - £6.99
```

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Google Gemini API (for both menu extraction and package generation)

## Future Improvements

- Support for more file formats
- Multiple package options
- Customizable preferences (dietary restrictions, price range)
- Save and share functionality
