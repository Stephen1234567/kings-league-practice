import { Hono } from 'hono'
import leaderBoard from '../db/leaderboard.json'

const app = new Hono()

app.get('/', (ctx) => {
  return ctx.json(
    {
      endpoint: '/leaderboard',
      description: 'Returns the leaderboard'
    }
  )
})

app.get('/leaderboard', (ctx) => {
  return ctx.json(leaderBoard)
})

export default app
