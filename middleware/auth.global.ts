export default defineNuxtRouteMiddleware(async () => {
  const authed = useState<boolean>('teamAuthed', () => false)
  const authChecked = useState<boolean>('teamAuthChecked', () => false)

  if (authed.value) {
    authChecked.value = true
    return
  }

  const res = await $fetch<{ authed: boolean }>('/api/auth/me').catch(() => ({ authed: false }))
  authed.value = !!res.authed
  authChecked.value = true
})
