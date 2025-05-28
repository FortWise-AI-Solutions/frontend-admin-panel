import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),

		prerender: {
			handleHttpError: ({ status, path }) => {
				if (status === 404 && path === '/src/lib/store/theme.css') {
					// Ігноруємо цю конкретну помилку
					return;
				}

				// Всі інші помилки кидаємо як зазвичай
				throw new Error(`Prerendering failed: ${status} ${path}`);
			}
		}
	}
};

export default config;
