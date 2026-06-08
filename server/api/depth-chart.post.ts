import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { requireTeamAuth } from '~/server/utils/members'

const positions = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'LC', 'RC', 'RF'] as const

function normalizeStarterMap(candidate: unknown) {
  const source = candidate && typeof candidate === 'object' ? candidate as Record<string, unknown> : {}

  return Object.fromEntries(
    positions.map((position) => [position, typeof source[position] === 'string' ? source[position] : '']),
  )
}

function normalizeBench(candidate: unknown) {
  const source = candidate && typeof candidate === 'object' ? candidate as Record<string, unknown> : {}

  return {
    male: typeof source.male === 'string' ? source.male : '',
    female: typeof source.female === 'string' ? source.female : '',
  }
}

function normalizeChart(candidate: unknown) {
  const source = candidate && typeof candidate === 'object' ? candidate as Record<string, unknown> : {}

  if ('starters' in source || 'bench' in source) {
    return {
      starters: normalizeStarterMap(source.starters),
      bench: normalizeBench(source.bench),
    }
  }

  return {
    starters: normalizeStarterMap(source),
    bench: normalizeBench({}),
  }
}

export default defineEventHandler(async (event) => {
  requireTeamAuth(event)

  const body = await readBody(event)

  if (!body || typeof body !== 'object' || !body.depthCharts || typeof body.depthCharts !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Depth chart payload must include depthCharts' })
  }

  const depthCharts = Object.fromEntries(
    Object.entries(body.depthCharts as Record<string, unknown>).map(([key, value]) => [
      key,
      normalizeChart(value),
    ]),
  )

  const filePath = join(process.cwd(), 'assets', 'data', 'depth-chart.json')
  const serialized = `${JSON.stringify({ depthCharts }, null, 2)}\n`

  await writeFile(filePath, serialized, 'utf8')

  return { ok: true }
})
