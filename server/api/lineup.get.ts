import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { requireTeamAuth } from '~/server/utils/members'

type RosterEntry = {
  name: string
}

const lineupSlots = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const

export default defineEventHandler(async (event) => {
  requireTeamAuth(event)

  const rosterPath = join(process.cwd(), 'assets', 'data', 'roster.json')
  const lineupPath = join(process.cwd(), 'assets', 'data', 'lineup.json')
  const [rosterRaw, lineupRaw] = await Promise.all([
    readFile(rosterPath, 'utf8'),
    readFile(lineupPath, 'utf8'),
  ])

  const roster = JSON.parse(rosterRaw)
  const lineup = JSON.parse(lineupRaw)

  if (!Array.isArray(roster)) {
    throw createError({ statusCode: 500, statusMessage: 'Invalid roster.json format' })
  }

  if (!lineup || typeof lineup !== 'object' || !lineup.lineup1 || typeof lineup.lineup1 !== 'object') {
    throw createError({ statusCode: 500, statusMessage: 'Invalid lineup.json format' })
  }

  const rosterEntries = roster as RosterEntry[]
  const rosterByName = new Map(rosterEntries.map((player) => [player.name, player]))
  const savedNames = lineupSlots
    .map((slot) => lineup.lineup1[slot])
    .filter((name): name is string => typeof name === 'string' && name.length > 0 && rosterByName.has(name))

  const usedNames = new Set(savedNames)
  const remainingPlayers = rosterEntries.filter((player) => !usedNames.has(player.name))

  return [...savedNames.map((name) => rosterByName.get(name)!), ...remainingPlayers]
})
