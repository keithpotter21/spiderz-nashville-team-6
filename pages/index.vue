<template>
  <div class="min-h-screen page-shell">
    <main class="max-w-6xl px-4 py-6 mx-auto md:px-6 md:py-10">
      <section class="hero-panel overflow-hidden rounded-[2rem] border border-white/60 bg-white/85 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
        <div class="absolute inset-0 pointer-events-none hero-glow" />

        <div class="relative flex flex-col gap-6">
          <div class="flex justify-end">
            <button
              class="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              @click="logout"
              title="Clears the access cookie"
            >
              Log out
            </button>
          </div>

          <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_340px]">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
                {{ info.spiderz }}
              </p>
              <h1 class="mt-3 max-w-4xl text-4xl font-black leading-none tracking-tight text-slate-950 md:text-6xl xl:text-7xl">
                {{ info.siteTitle }}
              </h1>
              <p class="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
                {{ info.tournamentDate }}
              </p>

              <!-- <div class="mt-6 flex flex-wrap gap-3">
                <span class="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
                  9 men on roster
                </span>
                <span class="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
                  3 women on roster
                </span>
              </div> -->
            </div>

            <div class="grid gap-4">
              <div class="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-3 shadow-lg shadow-slate-200/60">
                <img
                  :src="info.teamPhoto || '/images/Team-6.jpg'"
                  alt="Team 6 photo"
                  loading="lazy"
                  class="h-52 w-full rounded-[1.1rem] object-cover"
                >
              </div>

              <!-- <div class="grid grid-cols-2 gap-3">
                <div class="rounded-[1.4rem] bg-slate-950 p-4 text-white shadow-lg">
                  <div class="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                    Team
                  </div>
                  <div class="mt-2 text-3xl font-black">6</div>
                </div>
                <div class="rounded-[1.4rem] bg-gradient-to-br from-amber-300 via-orange-300 to-rose-300 p-4 text-slate-950 shadow-lg">
                  <div class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-800/70">
                    City
                  </div>
                  <div class="mt-2 text-lg font-black leading-tight">
                    Nashville, TN
                  </div>
                </div>
              </div> -->
            </div>
          </div>
        </div>
      </section>

      <section class="mt-6 rounded-[2rem] border border-slate-200/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Quick Hits
            </p>
            <h2 class="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
              {{ info.highlightsTitle }}
            </h2>
          </div>
        </div>

        <div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="(item, i) in info.highlights"
            :key="i"
            class="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {{ item.label }}
            </div>
            <div class="mt-3 text-lg font-bold leading-snug text-slate-900">
              {{ item.value }}
            </div>
          </div>
        </div>
      </section>

      <section class="mt-6 rounded-[2rem] border border-slate-200/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
        <div class="flex items-baseline justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Ballparks
            </p>
            <h2 class="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
              {{ info.whereWePlayTitle }}
            </h2>
          </div>
        </div>

        <div class="mt-5 grid gap-5 md:grid-cols-2">
          <div
            v-for="c in info.complexes"
            :key="c.title"
            class="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div class="aspect-[16/10] bg-slate-100">
              <img
                :src="c.image"
                :alt="c.title"
                class="h-full w-full object-cover"
                loading="lazy"
              />
            </div>

            <div class="p-5">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="text-lg font-bold text-slate-900">{{ c.title }}</h3>
                  <p class="mt-2 text-sm leading-6 text-slate-600">
                    {{ c.address }}
                  </p>
                </div>

                <a
                  :href="c.mapUrl"
                  target="_blank"
                  rel="noopener"
                  class="shrink-0 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  title="Open in Maps"
                >
                  Map
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-6 rounded-[2rem] border border-slate-200/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Rules
        </p>
        <h2 class="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
          Important Spiderz Tournament Rules
        </h2>
        <ul class="mt-5 space-y-3 text-sm leading-6 text-slate-700 md:text-base">
          <li>No bat flipping is allowed and is considered a dead ball out (DBO).</li>
          <li>Men that walk with a lady behind them MUST touch 1st base before proceeding to 2nd base.</li>
          <li>If you are on 3rd base and are "walked-in", you MUST touch home plate.</li>
          <li>Run rules are in effect EVERY GAME. NO FLIP FLOP: 20 runs after 3 innings, 15 runs after 4 innings, 10 runs after 5 innings.</li>
          <li>Home run rules: We are allowed Five (5) Home Runs/Game and female home runs DO COUNT towards total. All home runs over the limit will be considered a Dead Ball Out. Hit and Sit Rule, baserunners do not need to advance to the next base. They can go directly to the dugout.</li>
          <li>Pitch height limit is 4'-10' from the ground, at a "slow speed", and with a hump. Jukes/faking are allowed. 4'-10' is going to feel real flat if you don't regularly play strike zone tournaments. If you're not comfortable with "strike zone" pitches, I suggest finding some who can throw you strike zone pitches in batting practice.</li>
          <li>There are very specific "no-show" and "running late" rules for Spiderz. Games can/will start 30 mins early from scheduled game time. Please do your best to arrive at least 30 mins early to our games for my peace of mind LOL…</li>
          <li>
            Please read the official
            <a
              v-if="info.rulesPage"
              class="ml-1 font-semibold text-rose-600 underline decoration-rose-200 underline-offset-4"
              :href="info.rulesPage"
              target="_blank"
              rel="noopener noreferrer"
            >
              Spiderz Tournament Rules
            </a>
          </li>
        </ul>
      </section>

      <section class="mt-6 rounded-[2rem] border border-slate-200/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
        <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Team Directory
            </p>
            <h2 class="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
              The Roster
            </h2>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Tap a member to view their questionnaire answers.
              <a
                v-if="info.liveRoster"
                :href="info.liveRoster"
                target="_blank"
                rel="noopener noreferrer"
                class="font-semibold text-rose-600 underline decoration-rose-200 underline-offset-4"
              >
                View the live roster
              </a>.
            </p>
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <span class="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
              {{ rosterCounts.men }} men on roster
            </span>
            <span class="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
              {{ rosterCounts.women }} women on roster
            </span>
          </div>

          <!-- <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {{ members.length }} players listed
          </div> -->
        </div>

        <div v-if="pending" class="mt-10 text-slate-600">Loading roster…</div>
        <div v-else-if="error" class="mt-10 text-red-600">Failed to load roster.</div>
        <div v-else class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          <NuxtLink
            v-for="m in members"
            :key="m.id"
            :to="`/members/${m.id}`"
            class="group overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div class="aspect-[4/4.5] bg-slate-100">
              <img
                :src="`/members/${m.id}.jpg`"
                :alt="m.name"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                @error="onMemberImageError"
              />
            </div>
            <div class="space-y-2 p-4">
              <div class="font-bold leading-tight text-slate-900">{{ m.name }}</div>
              <div class="text-sm text-slate-600">{{ m.meta || 'Roster member' }}</div>

              <a
                v-if="m.facebook_url"
                :href="m.facebook_url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-800"
                :aria-label="`Open ${m.name}'s Facebook profile`"
                title="Facebook profile"
                @click.stop
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24H12.82v-9.294H9.692V11.01h3.128V8.309c0-3.1 1.894-4.788 4.66-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.31h3.587l-.467 3.696h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z"
                  />
                </svg>

                <span>Facebook profile</span>
              </a>
            </div>
          </NuxtLink>
        </div>
      </section>

      <LineupBoard />
      <DepthChartBoard />
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

type Member = {
  id: string
  name: string
  meta: string
  facebook_url?: string
  raw: Record<string, any>
}

const { data, pending, error } = await useFetch<{ rows: any[] }>('/api/members')

const members = computed<Member[]>(() => {
  const rows = data.value?.rows || []

  return rows
    .filter((r: any) => String(r['member_id'] || '').trim() !== '')
    .map((r: any, idx: number) => {
      const id = String(r['member_id']).trim()
      const fullName = String(r['Full Name (First and last)'] || '').trim()
      const called = String(r['What do you like to be called?'] || '').trim()
      const age = String(r['How old are you?'] || '').trim()
      const hometown = String(r['Where are you from (city, state)?'] || '').trim()
      const facebookUrl = String(r['facebook_url'] || '').trim()

      const name = called || fullName || `Member ${idx + 1}`
      const meta = [age, hometown].filter(Boolean).join(' • ')

      return {
        id,
        name,
        meta,
        facebook_url: facebookUrl,
        raw: r,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
})

const rosterCounts = computed(() => {
  return members.value.reduce(
    (totals, member) => {
      const rawSex = String(
        member.raw.sex ??
        member.raw.Sex ??
        member.raw.gender ??
        member.raw.Gender ??
        ''
      ).trim().toLowerCase()

      if (['m', 'male', 'man', 'men'].includes(rawSex)) {
        totals.men += 1
      } else if (['f', 'female', 'woman', 'women'].includes(rawSex)) {
        totals.women += 1
      }

      return totals
    },
    { men: 0, women: 0 }
  )
})

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  // force reload so middleware re-checks
  window.location.href = '/'
}

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
