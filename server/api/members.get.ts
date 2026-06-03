import { getMembersData, requireTeamAuth } from '~/server/utils/members'

export default defineEventHandler(async (event) => {
  requireTeamAuth(event)
  return getMembersData(event)
})
