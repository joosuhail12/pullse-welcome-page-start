import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Custom theme colors
				'soft-purple': {
					50: '#F5F3FF',
					100: '#E5DEFF',
					DEFAULT: '#E5DEFF'
				},
				'vivid-purple': {
					DEFAULT: 'hsl(var(--vivid-purple))',
					100: '#EDE9FE',
					200: '#DDD6FE',
					300: '#C4B5FD',
					400: '#A78BFA',
					500: '#8B5CF6',
					600: '#7C3AED',
					700: '#6D28D9',
					800: '#5B21B6',
					900: '#4C1D95'
				},
				// Chat theme variables
				'chat-header': {
					DEFAULT: 'hsl(var(--chat-header-bg))',
					foreground: 'hsl(var(--chat-header-text))'
				},
				'user-bubble': {
					DEFAULT: 'hsl(var(--user-bubble-bg))',
					foreground: 'hsl(var(--user-bubble-text))'
				},
				'system-bubble': {
					DEFAULT: 'hsl(var(--system-bubble-bg))',
					foreground: 'hsl(var(--system-bubble-text))'
				},
				'chat-bg': 'hsl(var(--chat-bg))'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					from: {
						opacity: '0',
						transform: 'translateY(8px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'typing-bounce': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-5px)'
					}
				},
				'slide-in-right': {
					'0%': { 
						opacity: '0',
						transform: 'translateX(20px)' 
					},
					'100%': { 
						opacity: '1',
						transform: 'translateX(0)' 
					}
				},
				'scale-in': {
					'0%': { 
						opacity: '0',
						transform: 'scale(0.9)' 
					},
					'100%': { 
						opacity: '1',
						transform: 'scale(1)' 
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out forwards',
				'typing-bounce': 'typing-bounce 1s infinite',
				'slide-in-right': 'slide-in-right 0.5s ease-out',
				'scale-in': 'scale-in 0.4s ease-out'
			},
			boxShadow: {
				'chat-bubble': '0 2px 8px rgba(0, 0, 0, 0.05)',
				'chat-widget': '0 4px 20px rgba(0, 0, 0, 0.1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
