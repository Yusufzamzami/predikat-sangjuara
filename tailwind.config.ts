import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        // Accordion animations
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" }
        },
        
        // Futuristic fade animations
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-20px) scale(0.95)" }
        },
        
        // Scale animations with glow
        "scale-in": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "50%": { transform: "scale(1.05)", opacity: "0.7" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "scale-out": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.8)", opacity: "0" }
        },
        
        // Slide animations
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" }
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" }
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        
        // Glow and pulse effects
        "glow-pulse": {
          "0%, 100%": { 
            "box-shadow": "0 0 20px hsl(var(--primary) / 0.3)",
            transform: "scale(1)"
          },
          "50%": { 
            "box-shadow": "0 0 40px hsl(var(--primary) / 0.6)",
            transform: "scale(1.02)"
          }
        },
        "neon-glow": {
          "0%, 100%": { 
            "box-shadow": "0 0 5px hsl(var(--accent)), 0 0 10px hsl(var(--accent)), 0 0 15px hsl(var(--accent))"
          },
          "50%": { 
            "box-shadow": "0 0 10px hsl(var(--accent)), 0 0 20px hsl(var(--accent)), 0 0 30px hsl(var(--accent))"
          }
        },
        
        // Floating animation
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        
        // Spin with glow
        "spin-glow": {
          "0%": { 
            transform: "rotate(0deg)",
            "box-shadow": "0 0 20px hsl(var(--primary) / 0.3)"
          },
          "50%": {
            "box-shadow": "0 0 30px hsl(var(--primary) / 0.6)"
          },
          "100%": { 
            transform: "rotate(360deg)",
            "box-shadow": "0 0 20px hsl(var(--primary) / 0.3)"
          }
        },
        
        // Shimmer effect
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        
        // Bounce with scale
        "bounce-scale": {
          "0%, 20%, 53%, 80%, 100%": { 
            transform: "translate3d(0,0,0) scale(1)" 
          },
          "40%, 43%": { 
            transform: "translate3d(0, -30px, 0) scale(1.1)" 
          },
          "70%": { 
            transform: "translate3d(0, -15px, 0) scale(1.05)" 
          },
          "90%": { 
            transform: "translate3d(0, -4px, 0) scale(1.02)" 
          }
        },
        
        // Matrix-like digital rain
        "digital-rain": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(100vh)", opacity: "0" }
        }
      },
      animation: {
        // Basic animations
        "accordion-down": "accordion-down 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "accordion-up": "accordion-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-in": "fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-out": "fade-out 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-in": "scale-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-out": "scale-out 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in-right": "slide-in-right 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in-left": "slide-in-left 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-up": "slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        
        // Futuristic effects
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "neon-glow": "neon-glow 1.5s ease-in-out infinite alternate",
        "float": "float 3s ease-in-out infinite",
        "spin-glow": "spin-glow 2s linear infinite",
        "shimmer": "shimmer 2s infinite",
        "bounce-scale": "bounce-scale 1s ease-in-out infinite",
        "digital-rain": "digital-rain 3s linear infinite",
        
        // Combined animations
        "enter": "fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1), scale-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "exit": "fade-out 0.3s cubic-bezier(0.4, 0, 0.2, 1), scale-out 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
