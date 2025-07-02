// tailwind.config.js
export default {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      colors: {
        purpleCustom: '#5D2D8E',
      },
      perspective: {
        1000: "1000px",
      },
    },
  },
  variants: {
    extend: {
      backfaceVisibility: ["group-hover"],
      transform: ["group-hover"],
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".backface-hidden": {
          "backface-visibility": "hidden",
        },
        ".preserve-3d": {
          "transform-style": "preserve-3d",
        },
        ".perspective": {
          perspective: "1000px",
        },
        ".my-rotate-y-180": {
          transform: "rotateY(180deg)",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
