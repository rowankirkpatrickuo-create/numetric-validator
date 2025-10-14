import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0F3342",
          navy700: "#124457",
          navy900: "#0B2631",
          green: "#2FA85A",
          gold: "#F4B400",
          bg: "#F7FBFD",
        },
      },
      boxShadow: {
        soft: "0 6px 24px rgba(15,51,66,0.08)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
