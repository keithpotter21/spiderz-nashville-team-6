import type { H3Event } from 'h3'

type MembersResponse = {
  rows: any[]
}

const CACHE_TTL_MS = 60 * 1000

let cachedMembers: { expiresAt: number, data: MembersResponse } | null = null
let inflightRequest: Promise<MembersResponse> | null = null

export function requireTeamAuth(event: H3Event) {
  if (getCookie(event, 'team_auth') !== '1') {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
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
      throw createError({ statusCode: 500, statusMessage: 'Missing GOOGLE_SHEETS_ENDPOINT' })
    }

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
  })()

  try {
    return await inflightRequest
  } finally {
    inflightRequest = null
  }
}
