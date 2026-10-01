import path from 'node:path'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from '@/config/env'
import { errorMiddleware } from '@/middlewares/error.middleware'
import { authRoutes } from '@/modules/auth/auth.routes'
import { fichaRoutes } from '@/modules/ficha/ficha.routes'
import { logger } from '@/utils/logger'

const app = express()

app.set('trust proxy', 1)

// `crossOriginResourcePolicy` relaxado só para as fotos em /uploads serem carregáveis a partir
// do frontend (origem diferente em dev); o resto das proteções do Helmet fica no padrão.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: config.frontendUrl, credentials: true }))
app.use(express.json())
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: config.nodeEnv })
})

app.use('/api/auth', authRoutes)
app.use('/api/ficha', fichaRoutes)

app.use(errorMiddleware as express.ErrorRequestHandler)

app.listen(config.port, () => {
  logger.info(`TAG Resgate backend rodando na porta ${config.port} [${config.nodeEnv}]`)
})

export default app
