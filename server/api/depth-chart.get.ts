import { readFile } from 'node:fs/promises'
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

  const filePath = join(process.cwd(), 'assets', 'data', 'depth-chart.json')
  const raw = await readFile(filePath, 'utf8')
  const chart = JSON.parse(raw)

  if (!chart || typeof chart !== 'object') {
    throw createError({ statusCode: 500, statusMessage: 'Invalid depth-chart.json format' })
  }

  if ('depthCharts' in chart && chart.depthCharts && typeof chart.depthCharts === 'object') {
    const depthCharts = Object.fromEntries(
      Object.entries(chart.depthCharts as Record<string, unknown>).map(([key, value]) => [key, normalizeChart(value)]),
    )

    return { depthCharts }
  }

  if ('starters' in chart && chart.starters && typeof chart.starters === 'object') {
    const legacy = chart as Record<string, unknown>
    const alternateEntries = Object.entries(legacy)
      .filter(([key, value]) => key !== 'starters' && key !== 'bench' && value && typeof value === 'object')
      .map(([key, value]) => [key, normalizeChart(value)])

    return {
      depthCharts: {
        primary: {
          starters: normalizeStarterMap(legacy.starters),
          bench: normalizeBench(legacy.bench),
        },
        ...Object.fromEntries(alternateEntries),
      },
    }
  }

  throw createError({ statusCode: 500, statusMessage: 'Invalid depth-chart.json format' })
})
