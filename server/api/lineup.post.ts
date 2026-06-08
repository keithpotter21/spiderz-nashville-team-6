import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { requireTeamAuth } from '~/server/utils/members'

const lineupSlots = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const

export default defineEventHandler(async (event) => {
  requireTeamAuth(event)

  const body = await readBody(event)

  if (!body || typeof body !== 'object' || !Array.isArray(body.lineup)) {
    throw createError({ statusCode: 400, statusMessage: 'Lineup payload must include a lineup array' })
  }

  const lineup1 = Object.fromEntries(
    lineupSlots.map((slot, index) => [
      slot,
      typeof body.lineup[index]?.name === 'string' ? body.lineup[index].name : '',
    ]),
  )

  const filePath = join(process.cwd(), 'assets', 'data', 'lineup.json')
  const serialized = `${JSON.stringify({ lineup1 }, null, 2)}\n`

  await writeFile(filePath, serialized, 'utf8')

  return { ok: true }
})
