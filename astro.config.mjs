import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
// https://astro.build/config
export default defineConfig({
  site: 'https://paraschausali48-lab.github.io/Paras-Eureka-Forbes/',
  base: '/Paras-Eureka-Forbes/',
  trailingSlash: 'always',
  prefetch: true,
  integrations: [preact()],
});
