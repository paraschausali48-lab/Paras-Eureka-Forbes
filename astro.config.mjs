import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
// https://astro.build/config
export default defineConfig({
  site: 'https://paraschausali48-lab.github.io',
  base: '/Paras-Eureka-Forbes',
  integrations: [preact()],
});
