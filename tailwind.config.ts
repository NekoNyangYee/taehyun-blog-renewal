import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			width: {
				profileImage: 'var(--width-profile-image)'
			},
			height: {
				profileImage: 'var(--height-profile-image)'
			},
			backgroundColor: {
				kakao: 'var(--background-color-kakaologin)',
				google: 'var(--background-color-googlelogin)',
				navButton: 'var(--background-color-nav-button)',
				logoutButton: 'var(--background-color-nav-logout)',
				searchInput: 'var(--background-color-input)',
				editButton: 'var(--background-color-edit)',
				switchedPublicButton: 'var(--background-color-switch-public)',
				switchedPrivateButton: 'var(--background-color-switch-private)'
			},
			borderColor: {
				containerColor: 'var(--border-color-container)',
				logoutColor: 'var(--border-color-logout)',
				searchInput: 'var(--border-color-input)',
				editButton: 'var(--border-color-edit)',
				switchedPublic: 'var(--border-color-switch-public)',
				switchedPrivate: 'var(--border-color-switch-private)'
			},
			borderRadius: {
				button: 'var(--radius-button)',
				container: 'var(--radius-container)'
			},
			padding: {
				button: 'var(--padding-button)',
				container: 'var(--padding-container)'
			},
			fontSize: {
				mainTitle: 'var(--text-size-main-title)',
				containerTitle: 'var(--text-size-container-title)',
				statisticTitle: 'var(--text-size-statistical-container-title)'
			},
			textColor: {
				logoutText: 'var(--text-color-logout)',
				metricsText: 'var(--text-color-metrics)',
				addButton: 'var(--text-color-button)',
				editButton: 'var(--text-color-edit)',
				switchedPublic: 'var(--text-color-switch-public)',
				switchedPrivate: 'var(--text-color-switch-private)'
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px'
			},
			maxWidth: {
				'custom-3xl': '1580px'
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;