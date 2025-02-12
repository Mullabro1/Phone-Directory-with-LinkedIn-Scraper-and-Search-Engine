// tailwind.config.js
export default {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}',  // Adjust this to match your project structure
    './public/index.html',              // Include public index.html
  ],
  theme: {
    extend: {
      colors: {
        customBlue: '#1E40AF', // Example custom color
      },
    },
  },
  plugins: [],
};
