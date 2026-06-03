<template>
  <div class="min-h-screen page-shell">
    <main class="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <section class="hero-panel overflow-hidden rounded-[2rem] border border-white/60 bg-white/85 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
        <div class="absolute inset-0 pointer-events-none hero-glow" />

        <div class="relative">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
          >
            <span aria-hidden="true">←</span>
            <span>Back to roster</span>
          </NuxtLink>

          <div v-if="pending" class="mt-10 rounded-[1.5rem] bg-white/80 p-6 text-slate-600 shadow-sm">
            Loading member…
          </div>

          <div v-else-if="error" class="mt-10 rounded-[1.5rem] bg-white/80 p-6 text-red-600 shadow-sm">
            Failed to load roster.
          </div>

          <div
            v-else-if="member"
            class="mt-6 grid items-start gap-6 lg:grid-cols-2"
          >
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
                Team Profile
              </p>
              <h1 class="mt-3 text-4xl font-black leading-none tracking-tight text-slate-950 md:text-6xl">
                {{ member.name }}
              </h1>
              <p v-if="member.meta" class="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
                {{ member.meta }}
              </p>

              <div class="mt-6 flex flex-wrap gap-3">
                <span class="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
                  Bats: {{ member.bats || 'Unknown' }}
                </span>
                <span class="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                  Throws: {{ member.throws || 'Unknown' }}
                </span>
              </div>
            </div>

            <div class="grid gap-4 lg:pl-6">
              <div class="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-3 shadow-lg shadow-slate-200/60">
                <img
                  :src="`/members/${member.id}.jpg`"
                  :alt="member.name"
                  class="h-full w-full rounded-[1.1rem] object-contain"
                  loading="lazy"
                  @error="onMemberImageError"
                />
              </div>

            </div>
          </div>

          <div v-else class="mt-10 rounded-[1.5rem] bg-white/80 p-6 text-slate-600 shadow-sm">
            Member not found. Check <code>member_id</code>.
          </div>
        </div>
      </section>

      <section
        v-if="member"
        class="mt-6 rounded-[2rem] border border-slate-200/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-6"
      >
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Questionnaire
          </p>
          <h2 class="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
            Player Notes
          </h2>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            A quick read on how {{ member.name }} plays, what they prefer, and what the team should know.
          </p>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <div
            v-for="item in fields"
            :key="item.key"
            class="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {{ item.label }}
            </div>
            <div class="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800 md:text-base">
              {{ item.value }}
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="mt-12 border-t border-slate-900/10 bg-slate-950 px-4 py-10 text-sm text-white">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 text-center">
        <img
          src="/images/spiderz.png"
          alt="Spiderz"
          class="h-20 w-auto object-contain"
        />
        <p class="text-white/80">&copy; {{ info.siteTitle }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import info from '~/assets/data/team-info.json'

const route = useRoute()
const id = String(route.params.id)

const { data, pending, error } = await useFetch<{ row: any }>(`/api/members/${id}`)

const member = computed(() => {
  const r = data.value?.row
  if (!r) return null

  const fullName = String(r['Full Name (First and last)'] || '').trim()
  const called = String(r['What do you like to be called?'] || '').trim()
  const age = String(r['How old are you?'] || '').trim()
  const hometown = String(r['Where are you from (city, state)?'] || '').trim()
  const throws = String(r['Which arm is your throwing arm?'] || '').trim()
  const b = String(r['What side of the plate do you bat?'] || '').trim()
  const bats = b === 'I\’m a righty' ? 'Right' : b ? 'Left' : ''
  return {
    id,
    name: called || fullName || id,
    meta: [age, hometown].filter(Boolean).join(' • '),
    throws,
    bats,
    raw: r,
  }
})

const HITTER_Q = 'What type of hitter are you (select all that apply)?'

const HITTER_TYPE_MAP = new Map<string, string>([
  [
    'Power hitter - Goal: to hit home runs or drive the ball deep into the gaps for extra bases.',
    'Power hitter',
  ],
  [
    'Contact hitter - Goal: to consistently make solid contact and put the ball in play to get on base.',
    'Contact hitter',
  ],
  [
    'Line-drive hitter - Goal: To hit "lasers" that stay low and hard, avoiding pop-ups or routine grounders.',
    'Line-drive hitter',
  ],
  [
    'Backside hitter- Goal: To hit the ball to the opposite field by letting the ball travel deeper into the hitting zone.',
    'Backside hitter',
  ],
])

function normalizeHitterTypes(raw: unknown): string[] {
  // Supports: array (ideal), OR a single string OR comma-separated string
  const list: string[] = Array.isArray(raw)
    ? raw.map(String)
    : typeof raw === 'string'
      ? raw.split(',').map(s => s.trim()).filter(Boolean)
      : raw != null
        ? [String(raw)]
        : []

  const normalized = list
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => HITTER_TYPE_MAP.get(s) || null)
    .filter(Boolean) as string[]

  return [...new Set(normalized)]
}

function formatFieldValue(key: string, value: unknown): string {
  if (key === HITTER_Q) {
    const types = normalizeHitterTypes(value)
    return types.length ? types.join(', ') : ''
  }
  return String(value ?? '')
}

const fields = computed(() => {
  if (!member.value) return []
  const r = member.value.raw

  // Hide internal/utility fields
  const hidden = new Set(['photo_url', 'member_id'])

  // Display in a friendly order (only show non-empty)
  const order = [
    'How many Spiderz tournaments have you played?',
    'Competitiveness',
    'What kind of softball player are you?',
    'Speed',
    'Do you need a runner?',
    'Wii you be a runner?',
    'Which arm is your throwing arm?',
    'What side of the plate do you bat?',
    'Where do you normally hit in the lineup?',
    'What type of hitter are you (select all that apply)?',
    'On a scale of 1-5 rate your ability as a power hitter (be as objective as you can).',
    'How many home runs (approximately) have you hit in competivite softball this year or expect to hit? ',
    'Will you take a walk?',
    'Which position did you sign up for first?',
    'Which position did you sign up for second?',
    'Best defensive position?',
    '2nd best defensive position?',
    'Other defensive position (check all that apply)?',
    'What defensive position(s) you will not play (check all that apply)?',
    'Do you know how keep score using the scorebook?',
    'Do you have any sports medicine training? Meaning, can you wrap knees, ankles, etc.',
    'What are your pet peeves around softball?',
    'Question for the gentlemen, are you comfortable with a lady hitting behind you? Meaning, you understand that there maybe a time(s) where you are asked not to swing to work a walk.',
    'I read the above Spiderz rules and understand them.',
  ]

  return order
  .filter((k) => r[k] !== undefined && String(r[k]).trim() !== '' && !hidden.has(k))
  .map((k) => ({ key: k, label: k, value: formatFieldValue(k, r[k]) }))
})

function onMemberImageError(event: Event) {
  const image = event.target as HTMLImageElement | null

  if (!image || image.src.endsWith('/members/default.svg')) {
    return
  }

  image.src = '/members/default.svg'
}
</script>

<style scoped>
.page-shell {
  background:
    radial-gradient(circle at top left, rgba(251, 191, 36, 0.22), transparent 30%),
    radial-gradient(circle at top right, rgba(244, 63, 94, 0.16), transparent 28%),
    linear-gradient(180deg, #fff8f3 0%, #f8fafc 45%, #f6f7fb 100%);
}

.hero-panel {
  position: relative;
}

.hero-glow {
  background:
    radial-gradient(circle at 12% 18%, rgba(56, 189, 248, 0.16), transparent 24%),
    radial-gradient(circle at 88% 24%, rgba(251, 113, 133, 0.18), transparent 24%),
    radial-gradient(circle at 58% 95%, rgba(253, 186, 116, 0.16), transparent 20%);
}
</style>
