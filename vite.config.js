import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from external networks
    port: 5173, // Explicitly setting it to 5173 since Render will handle the port internally
  },
})
