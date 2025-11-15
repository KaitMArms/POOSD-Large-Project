import react from '@vitejs/plugin-react'
import { htmlInlineSources } from 'vite-plugin-html-inline-sources';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), htmlInlineSources()],
})
