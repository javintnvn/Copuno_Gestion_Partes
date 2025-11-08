import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [react()],
	define: {
		__BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString())
	},
	server: {
		port: 5173,
		open: true,
		proxy: {
			'/api': {
				target: 'http://localhost:3001',
				changeOrigin: true
			}
		}
	},
	build: {
		outDir: 'dist',
		sourcemap: false, // Desactivar sourcemaps en producción por seguridad
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: true, // Remover console.log en producción
				drop_debugger: true
			}
		},
		rollupOptions: {
			output: {
				manualChunks: {
					'react-vendor': ['react', 'react-dom', 'react-router-dom'],
					'ui-vendor': ['lucide-react']
				}
			}
		}
	}
}) 