import type { H3Event } from 'h3'
import rosterData from '~/assets/data/roster.json'

type MembersResponse = {
  rows: any[]
}

type RosterEntry = {
  name: string
  sex?: string
  batSide?: string
  lineupPosition?: string
  hitterType?: string
  powerRating?: number
  takeWalk?: string
  needRunner?: string
  beRunner?: string
  first?: string
  second?: string
  other?: string[]
}

const CACHE_TTL_MS = 60 * 1000

let cachedMembers: { expiresAt: number, data: MembersResponse } | null = null
let inflightRequest: Promise<MembersResponse> | null = null

export function requireTeamAuth(event: H3Event) {
  if (getCookie(event, 'team_auth') !== '1') {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
}

function slugifyMemberId(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toBatAnswer(side?: string) {
  if (side === 'Right') return 'I’m a righty'
  if (side === 'Left') return 'I’m a lefty'
  return ''
}

function buildFallbackMembersData(): MembersResponse {
  const roster = rosterData as RosterEntry[]

  return {
    rows: roster.map((player) => ({
      member_id: slugifyMemberId(player.name),
      'Full Name (First and last)': player.name,
      'What do you like to be called?': player.name,
      'Which arm is your throwing arm?': '',
      'What side of the plate do you bat?': toBatAnswer(player.batSide),
      'Where do you normally hit in the lineup?': player.lineupPosition || '',
      'What type of hitter are you (select all that apply)?': player.hitterType || '',
      'On a scale of 1-5 rate your ability as a power hitter (be as objective as you can).': player.powerRating ?? '',
      'Will you take a walk?': player.takeWalk || '',
      'Do you need a runner?': player.needRunner || '',
      'Wii you be a runner?': player.beRunner || '',
      'Which position did you sign up for first?': player.first || '',
      'Which position did you sign up for second?': player.second || '',
      'Other defensive position (check all that apply)?': Array.isArray(player.other) ? player.other.join(', ') : '',
    })),
  }
}

export async function getMembersData(event: H3Event): Promise<MembersResponse> {
  const now = Date.now()

  if (cachedMembers && cachedMembers.expiresAt > now) {
    return cachedMembers.data
  }

  if (inflightRequest) {
    return inflightRequest
  }

  inflightRequest = (async () => {
    const config = useRuntimeConfig(event)
    const endpoint = config.sheets?.endpoint

    if (!endpoint) {
      if (!import.meta.dev) {
        return buildFallbackMembersData()
      }

      throw createError({ statusCode: 500, statusMessage: 'Missing GOOGLE_SHEETS_ENDPOINT' })
    }

    try {
      const data = await $fetch<any>(endpoint, {
        params: config.sheets?.token ? { token: config.sheets.token } : undefined,
      })

      const normalized = {
        rows: Array.isArray(data?.rows) ? data.rows : [],
      }

      cachedMembers = {
        expiresAt: Date.now() + CACHE_TTL_MS,
        data: normalized,
      }

      return normalized
    } catch (error) {
      if (!import.meta.dev) {
        const fallback = buildFallbackMembersData()
        cachedMembers = {
          expiresAt: Date.now() + CACHE_TTL_MS,
          data: fallback,
        }
        return fallback
      }

      throw error
    }
  })()

  try {
    return await inflightRequest
  } finally {
    inflightRequest = null
  }
}
