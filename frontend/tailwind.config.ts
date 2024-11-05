import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
    	extend: {
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			brand: {
    				'50': '#F9F5FF',
    				'100': '#F4EBFF',
    				'200': '#E9D7FE',
    				'300': '#D6BBFB',
    				'400': '#B692F6',
    				'500': '#9E77ED',
    				'600': '#7F56D9',
    				'700': '#6941C6',
    				'800': '#53389E'
    			},
    			icon: 'var(--icon)',
    			complexity: {
    				hard: {
    					text: 'var(--complexity-hard-text)',
    					bg: 'var(--complexity-hard-bg)'
    				},
    				medium: {
    					text: 'var(--complexity-medium-text)',
    					bg: 'var(--complexity-medium-bg)'
    				},
    				easy: {
    					text: 'var(--complexity-easy-text)',
    					bg: 'var(--complexity-easy-bg)'
    				}
    			},
    			category: {
    				text: 'var(--category-text)',
    				bg: 'var(--category-bg)'
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		fontFamily: {
    			brand: ['var(--font-brand)'],
    			sans: ['var(--font-matter)'],
    			serif: ['var(--font-reckless-neue)'],
    			inter: ['var(--font-inter)']
    		},
    		screens: {
    			tablet: '640px',
    			laptop: '1024px',
    			desktop: '1280px'
    		},
    		dropShadow: {
    			'question-card': '0px 2px 4px rgba(0, 0, 0, 0.15)',
    			'question-details': '0px 8px 8px rgba(0, 0, 0, 0.15)'
    		},
    		keyframes: {
    			'caret-blink': {
    				'0%,70%,100%': {
    					opacity: '1'
    				},
    				'20%,50%': {
    					opacity: '0'
    				}
    			},
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
    			}
    		},
    		animation: {
    			'caret-blink': 'caret-blink 1.25s ease-out infinite',
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		},
    		typography: {
    			DEFAULT: {
    				css: {
    					'code::before': {
    						content: ''
    					},
    					'code::after': {
    						content: ''
    					}
    				}
    			}
    		}
    	}
    },
	plugins: [
		require('@tailwindcss/typography'),
		require("tailwindcss-animate")
	],
};
export default config;
