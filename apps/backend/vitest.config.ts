import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Os testes de integração usam um banco dedicado (ver scripts/test.mjs); rodam em série
    // para não competir pelas mesmas tabelas.
    fileParallelism: false,
    env: {
      DATABASE_URL: 'postgresql://tagresgate:tagresgate@localhost:5433/tagresgate_test',
      JWT_SECRET: 'segredo-de-teste-com-mais-de-32-caracteres-xxxx',
    },
  },
})
