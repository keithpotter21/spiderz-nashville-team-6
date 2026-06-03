import { deleteCookie } from 'h3'

export default defineEventHandler((event) => {
  deleteCookie(event, 'team_auth', { path: '/' })
  return { ok: true }
})
