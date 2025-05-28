import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'dark' | 'light';

function createThemeStore() {
    const { subscribe, set, update } = writable<Theme>('dark');

    return {
        subscribe,
        setTheme: (theme: Theme) => {
            if (browser) {
                // Зберігаємо в localStorage
                localStorage.setItem('appTheme', theme);
                // Встановлюємо атрибут на html елементі
                document.documentElement.setAttribute('data-theme', theme);
            }
            set(theme);
        },
        initTheme: () => {
            if (browser) {
                const savedTheme = localStorage.getItem('appTheme') as Theme;
                const theme = savedTheme || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
                set(theme);
            }
        }
    };
}

export const themeStore = createThemeStore();
