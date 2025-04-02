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
				sm: 'calc(var(--radius) - 4px)',
				xl: 'calc(var(--radius) + 2px)',
				'2xl': 'calc(var(--radius) + 4px)',
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
				'fade-in-right': {
					from: {
						opacity: '0',
						transform: 'translateX(10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'fade-in-left': {
					from: {
						opacity: '0',
						transform: 'translateX(-10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'typing-bounce': {
					'0%, 100%': {
						transform: 'translateY(0)',
						opacity: '0.6'
					},
					'50%': {
						transform: 'translateY(-5px)',
						opacity: '1'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'pulse-soft': {
					'0%, 100%': {
						opacity: '0.6'
					},
					'50%': {
						opacity: '1'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-5px)'
					}
				},
				'skeleton-pulse': {
					'0%, 100%': {
						opacity: '0.5'
					},
					'50%': {
						opacity: '0.8'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out forwards',
				'fade-in-right': 'fade-in-right 0.3s ease-out forwards',
				'fade-in-left': 'fade-in-left 0.3s ease-out forwards',
				'typing-bounce': 'typing-bounce 1s infinite',
				'scale-in': 'scale-in 0.2s ease-out',
				'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite'
			},
			boxShadow: {
				'chat-bubble': '0 2px 8px rgba(0, 0, 0, 0.05)',
				'chat-widget': '0 4px 20px rgba(0, 0, 0, 0.1)',
				'chat-widget-hover': '0 6px 24px rgba(0, 0, 0, 0.15)',
				'glassmorphic': '0 8px 32px rgba(31, 38, 135, 0.15)',
				'glow': '0 0 15px rgba(139, 92, 246, 0.5)'
			},
			backdropBlur: {
				xs: '2px',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
