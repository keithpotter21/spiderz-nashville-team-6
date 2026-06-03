export default defineEventHandler((event) => {
  return { authed: getCookie(event, 'team_auth') === '1' }
})
