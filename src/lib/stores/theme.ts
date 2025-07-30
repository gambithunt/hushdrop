import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>('system');

	return {
		subscribe,
		set,
		update,
		init: () => {
			if (browser) {
				const stored = localStorage.getItem('theme') as Theme;
				if (stored) {
					set(stored);
				}
				applyTheme(stored || 'system');
			}
		},
		setTheme: (theme: Theme) => {
			if (browser) {
				localStorage.setItem('theme', theme);
				set(theme);
				applyTheme(theme);
			}
		}
	};
}

function applyTheme(theme: Theme) {
	if (!browser) return;

	const root = document.documentElement;
	
	if (theme === 'system') {
		const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		root.classList.toggle('dark', systemPrefersDark);
	} else {
		root.classList.toggle('dark', theme === 'dark');
	}
}

export const theme = createThemeStore();

// Listen for system theme changes
if (browser) {
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		theme.subscribe(currentTheme => {
			if (currentTheme === 'system') {
				applyTheme('system');
			}
		})();
	});
}