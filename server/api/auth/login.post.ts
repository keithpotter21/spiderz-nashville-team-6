import { setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ password?: string }>(event)
  const config = useRuntimeConfig()

  if (!config.teamPassword) {
    throw createError({ statusCode: 500, statusMessage: 'Server missing TEAM_PASSWORD' })
  }

  if (!body?.password || body.password !== config.teamPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid password' })
  }

  setCookie(event, 'team_auth', '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  return { ok: true }
})
