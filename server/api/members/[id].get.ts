import { getMembersData, requireTeamAuth } from '~/server/utils/members'

export default defineEventHandler(async (event) => {
  requireTeamAuth(event)

  const id = String(event.context.params?.id || '').trim()
  const data = await getMembersData(event)
  const row = data.rows.find((entry: any) => String(entry?.member_id || '').trim() === id) || null

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Member not found' })
  }

  return { row }
})
