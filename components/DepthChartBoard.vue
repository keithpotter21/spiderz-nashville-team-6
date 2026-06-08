<template>
  <section class="mt-6 rounded-[2rem] border border-slate-200/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
    <div class="flex flex-col gap-4">
      <div class="grid gap-3 md:grid-cols-[minmax(0,4fr)_minmax(0,1fr)] md:items-center">
        <h2 class="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
          Defensive Depth Chart: {{ activeChartLabel }}
        </h2>
        <div class="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 md:justify-self-end">
          <span v-if="!isEditable">Read only</span>
          <span v-else-if="saveState === 'saving'">Saving chart...</span>
          <span v-else-if="saveState === 'saved'">Chart saved</span>
          <span v-else-if="saveState === 'error'" class="text-red-600">Save failed</span>
          <span v-else>{{ depthRows.length }} positions</span>
        </div>
      </div>

      <div class="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in filterOptions"
            :key="option.value"
            type="button"
            class="rounded-full border px-4 py-2 text-sm font-semibold transition"
            :class="positionFilter === option.value
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
            @click="positionFilter = option.value"
          >
            {{ option.label }}
          </button>

          <select
            v-model="playerFilter"
            class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            <option value="">All Players</option>
            <option
              v-for="player in playerOptions"
              :key="player"
              :value="player"
            >
              {{ player }}
            </option>
          </select>

          <select
            v-model="sexFilter"
            class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            <option value="">All Sexes</option>
            <option value="M">Men</option>
            <option value="F">Women</option>
          </select>
        </div>

        <div class="flex flex-wrap gap-2 lg:justify-end">
          <select
            v-model="activeChartKey"
            class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            <option
              v-for="option in chartOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>

          <button
            v-if="isEditable"
            type="button"
            class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            @click="addAlternateChart"
          >
            Add Alternate
          </button>

          <button
            v-if="isEditable"
            type="button"
            class="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
            @click="clearActiveChart"
          >
            Clear Chart
          </button>

          <button
            v-if="isEditable && canDeleteActiveChart"
            type="button"
            class="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            @click="deleteActiveChart"
          >
            Delete Alternate
          </button>
        </div>
      </div>
    </div>

    <div class="mt-5 overflow-x-auto">
      <table class="min-w-full overflow-hidden rounded-lg border border-slate-200">
        <thead class="bg-slate-800 text-white">
          <tr>
            <th class="px-4 py-3 text-left">Position</th>
            <th class="px-4 py-3 text-left">Starter</th>
            <th class="px-4 py-3 text-left">Additional Depth</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-200">
          <tr
            v-for="(row, index) in depthRows"
            :key="row.label"
            :class="index % 2 === 1 ? 'bg-slate-50' : 'bg-white'"
          >
            <td class="px-4 py-3 font-bold">{{ row.label }}</td>
            <td
              class="px-4 py-3"
              :class="dropTarget === row.label ? 'bg-amber-50/70' : ''"
              @dragover.prevent="isEditable && onStarterDragOver(row.label)"
              @dragleave="isEditable && onStarterDragLeave(row.label)"
              @drop.prevent="isEditable && onStarterDrop(row.label)"
            >
              <div class="min-h-10 rounded-lg border border-dashed border-slate-300 px-3 py-2">
                <span
                  v-if="row.starter"
                  :draggable="isEditable"
                  class="inline-flex"
                  :class="nameClass(row.starter.sex)"
                  :title="isEditable ? 'Drag to change starter' : undefined"
                  @dragstart="isEditable && onDragStart(row.label, row.starter.name, 'starter')"
                  @dragend="isEditable && onDragEnd()"
                >
                  {{ formatPlayer(row.starter, row.sourcePosition) }}
                </span>
                <span v-else class="text-slate-400">{{ isEditable ? 'Drop starter here' : 'Unassigned' }}</span>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-x-2 gap-y-1">
                <template v-if="filteredDepth(row).length">
                  <span
                    v-for="player in filteredDepth(row)"
                    :key="`${row.label}-${player.name}`"
                    :draggable="isEditable"
                    :class="[isEditable ? 'cursor-grab' : '', depthPlayerClass(player, row)]"
                    @dragstart="isEditable && onDragStart(row.label, player.name, 'depth')"
                    @dragend="isEditable && onDragEnd()"
                  >
                    {{ formatPlayer(player, row.sourcePosition) }}
                  </span>
                </template>
                <span v-else class="text-slate-400">—</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-6 grid gap-4 lg:grid-cols-2">
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 class="mt-2 text-lg font-bold text-slate-900">Male Bench</h3>
        <div class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="player in sittingMen"
            :key="player.name"
            class="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
            :class="nameClass(player.sex)"
          >
            {{ player.name }}
          </span>
          <span v-if="!sittingMen.length" class="text-slate-400">No men sitting</span>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 class="mt-2 text-lg font-bold text-slate-900">Female Bench</h3>
        <div class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="player in sittingWomen"
            :key="player.name"
            class="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
            :class="nameClass(player.sex)"
          >
            {{ player.name }}
          </span>
          <span v-if="!sittingWomen.length" class="text-slate-400">No women sitting</span>
        </div>
      </div>
    </div>

    <div class="mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
      <h3 class="mb-2 text-lg font-bold">Marker Legend</h3>
      <p>
        <span class="font-semibold">🥇</span> denotes best position and
        <span class="font-semibold">🥈</span> denotes second best position.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import depthChartData from '~/assets/data/depth-chart.json'
import rosterData from '~/assets/data/roster.json'

type RosterPlayer = {
  name: string
  sex: string
  first?: string
  second?: string
  other?: string[]
}

type DepthRow = {
  label: string
  sourcePosition: string
  starter: RosterPlayer | null
  depth: RosterPlayer[]
}

type StarterMap = Record<string, string>
type DepthChartConfig = {
  starters: StarterMap
  bench: {
    male: string
    female: string
  }
}

type DepthChartsMap = Record<string, DepthChartConfig>

type DragPayload = {
  rowLabel: string
  playerName: string
  source: 'starter' | 'depth'
}

type PositionFilter = 'all' | 'first' | 'second'

const positions = [
  { label: 'P', sourcePosition: 'P' },
  { label: 'C', sourcePosition: 'C' },
  { label: '1B', sourcePosition: '1B' },
  { label: '2B', sourcePosition: '2B' },
  { label: '3B', sourcePosition: '3B' },
  { label: 'SS', sourcePosition: 'SS' },
  { label: 'LF', sourcePosition: 'LF' },
  { label: 'LC', sourcePosition: 'LC' },
  { label: 'RC', sourcePosition: 'RC' },
  { label: 'RF', sourcePosition: 'RF' },
] as const

const isEditable = import.meta.dev
const dragState = ref<DragPayload | null>(null)
const dropTarget = ref<string | null>(null)
const positionFilter = ref<PositionFilter>('all')
const playerFilter = ref('')
const sexFilter = ref('')
const saveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
let saveStateTimer: ReturnType<typeof setTimeout> | null = null
const filterOptions: Array<{ label: string, value: PositionFilter }> = [
  { label: 'All', value: 'all' },
  { label: '🥇', value: 'first' },
  { label: '🥈', value: 'second' },
]
const depthChartResponse = isEditable
  ? await useFetch<{ depthCharts?: DepthChartsMap }>('/api/depth-chart')
  : { data: ref<{ depthCharts?: DepthChartsMap } | null>(null) }

function positionRank(player: RosterPlayer, position: string) {
  if (player.first === position) return 0
  if (player.second === position) return 1
  if ((player.other || []).includes(position)) return 2
  return 99
}

function matchesPosition(player: RosterPlayer, position: string) {
  return positionRank(player, position) !== 99
}

function positionMarker(player: RosterPlayer, position: string) {
  if (player.first === position) return '🥇 '
  if (player.second === position) return '🥈 '
  return ''
}

function matchesFilter(player: RosterPlayer, position: string) {
  if (positionFilter.value === 'first') {
    return player.first === position
  }

  if (positionFilter.value === 'second') {
    return player.second === position
  }

  return true
}

function formatPlayer(player: RosterPlayer, position: string) {
  return `${positionMarker(player, position)}${player.name}`
}

function nameClass(sex: string) {
  return sex === 'F' ? 'font-medium text-rose-600' : 'text-slate-900'
}

function depthPlayerClass(player: RosterPlayer, row: DepthRow) {
  if (isAssigned(player.name)) {
    return 'text-slate-400'
  }

  return nameClass(player.sex)
}

function filteredDepth(row: DepthRow) {
  return row.depth.filter((player) => {
    if (!matchesFilter(player, row.sourcePosition)) {
      return false
    }

    if (playerFilter.value && player.name !== playerFilter.value) {
      return false
    }

    if (sexFilter.value && player.sex !== sexFilter.value) {
      return false
    }

    return true
  })
}

const roster = rosterData as RosterPlayer[]

function emptyStarterMap(): StarterMap {
  return Object.fromEntries(positions.map(({ label }) => [label, '']))
}

function emptyChartConfig(): DepthChartConfig {
  return {
    starters: emptyStarterMap(),
    bench: { male: '', female: '' },
  }
}

function normalizeDepthCharts(incoming?: DepthChartsMap | null) {
  if (!incoming || !Object.keys(incoming).length) {
    return { primary: emptyChartConfig() }
  }

  return Object.fromEntries(
    Object.entries(incoming).map(([key, chart]) => [
      key,
      {
        starters: {
          ...emptyStarterMap(),
          ...(chart?.starters || {}),
        },
        bench: {
          male: '',
          female: '',
          ...(chart?.bench || {}),
        },
      },
    ]),
  ) as DepthChartsMap
}

const depthCharts = ref<DepthChartsMap>({ primary: emptyChartConfig() })
const activeChartKey = ref('primary')

if (!isEditable) {
  const normalized = normalizeDepthCharts((depthChartData as { depthCharts?: DepthChartsMap }).depthCharts)
  depthCharts.value = normalized

  if (!normalized[activeChartKey.value]) {
    activeChartKey.value = Object.keys(normalized)[0] || 'primary'
  }
}

watch(depthChartResponse.data, (nextValue) => {
  if (!isEditable) {
    return
  }

  const normalized = normalizeDepthCharts(nextValue?.depthCharts)
  depthCharts.value = normalized

  if (!normalized[activeChartKey.value]) {
    activeChartKey.value = Object.keys(normalized)[0] || 'primary'
  }
}, { immediate: true })

const activeStarterAssignments = computed<StarterMap>(() =>
  depthCharts.value[activeChartKey.value]?.starters || emptyStarterMap(),
)

function isAssigned(playerName: string) {
  return Object.values(activeStarterAssignments.value).includes(playerName)
}

const depthRows = computed<DepthRow[]>(() =>
  positions.map(({ label, sourcePosition }) => {
    const depth = roster
      .filter((player) => matchesPosition(player, sourcePosition))
      .sort((a, b) => {
        const rankDiff = positionRank(a, sourcePosition) - positionRank(b, sourcePosition)
        if (rankDiff !== 0) return rankDiff
        return a.name.localeCompare(b.name)
      })

    const starterName = activeStarterAssignments.value[label]
    const starter = depth.find((player) => player.name === starterName) || null

    return {
      label,
      sourcePosition,
      starter,
      depth: starter
        ? [
            ...depth.filter((player) => player.name !== starter.name),
            starter,
          ]
        : depth,
    }
  }),
)

const playerOptions = computed(() =>
  [...new Set(depthRows.value.flatMap((row) => row.depth.map((player) => player.name)))]
    .sort((a, b) => a.localeCompare(b))
)

const sittingPlayers = computed(() =>
  roster.filter((player) => !isAssigned(player.name))
)

const sittingMen = computed(() =>
  sittingPlayers.value.filter((player) => player.sex === 'M')
)

const sittingWomen = computed(() =>
  sittingPlayers.value.filter((player) => player.sex === 'F')
)

const chartOptions = computed(() =>
  Object.keys(depthCharts.value).map((key) => ({
    value: key,
    label: key === 'primary'
      ? 'Primary'
      : key.replace(/^alternate(\d+)$/, 'Alternate $1'),
  })),
)

const canDeleteActiveChart = computed(() => activeChartKey.value !== 'primary')
const activeChartLabel = computed(() =>
  chartOptions.value.find((option) => option.value === activeChartKey.value)?.label || 'Primary',
)

function setSaveState(state: 'idle' | 'saving' | 'saved' | 'error') {
  saveState.value = state

  if (saveStateTimer) {
    clearTimeout(saveStateTimer)
    saveStateTimer = null
  }

  if (state === 'saved' || state === 'error') {
    saveStateTimer = setTimeout(() => {
      saveState.value = 'idle'
    }, 2000)
  }
}

function onDragStart(rowLabel: string, playerName: string, source: 'starter' | 'depth') {
  dragState.value = { rowLabel, playerName, source }
}

function onDragEnd() {
  dragState.value = null
  dropTarget.value = null
}

function onStarterDragOver(rowLabel: string) {
  if (!dragState.value || dragState.value.rowLabel !== rowLabel) {
    dropTarget.value = null
    return
  }

  dropTarget.value = rowLabel
}

function onStarterDragLeave(rowLabel: string) {
  if (dropTarget.value === rowLabel) {
    dropTarget.value = null
  }
}

function onStarterDrop(rowLabel: string) {
  if (!isEditable) {
    onDragEnd()
    return
  }

  if (!dragState.value || dragState.value.rowLabel !== rowLabel) {
    onDragEnd()
    return
  }

  const row = depthRows.value.find((entry) => entry.label === rowLabel)
  if (!row) {
    onDragEnd()
    return
  }

  const draggedPlayer = row.depth.find((player) => player.name === dragState.value?.playerName)
  if (!draggedPlayer) {
    onDragEnd()
    return
  }

  const previous = JSON.parse(JSON.stringify(depthCharts.value)) as DepthChartsMap
  depthCharts.value = {
    ...depthCharts.value,
    [activeChartKey.value]: {
      starters: Object.fromEntries(
        Object.entries(activeStarterAssignments.value).map(([position, name]) => [
          position,
          name === draggedPlayer.name ? '' : name,
        ]),
      ) as StarterMap,
      bench: {
        ...depthCharts.value[activeChartKey.value].bench,
      },
    },
  }
  depthCharts.value[activeChartKey.value].starters[rowLabel] = draggedPlayer.name

  persistDepthChart().catch(() => {
    depthCharts.value = previous
  }).finally(() => {
    onDragEnd()
  })
}

function addAlternateChart() {
  if (!isEditable) {
    return
  }

  const previous = JSON.parse(JSON.stringify(depthCharts.value)) as DepthChartsMap
  const previousActive = activeChartKey.value
  const existingKeys = Object.keys(depthCharts.value)
  let index = 1

  while (existingKeys.includes(`alternate${index}`)) {
    index += 1
  }

  const nextKey = `alternate${index}`
  depthCharts.value = {
    ...depthCharts.value,
    [nextKey]: emptyChartConfig(),
  }
  activeChartKey.value = nextKey

  persistDepthChart().catch(() => {
    depthCharts.value = previous
    activeChartKey.value = previousActive
  })
}

function deleteActiveChart() {
  if (!isEditable) {
    return
  }

  if (!canDeleteActiveChart.value) {
    return
  }

  const previous = JSON.parse(JSON.stringify(depthCharts.value)) as DepthChartsMap
  const previousActive = activeChartKey.value
  const nextCharts = { ...depthCharts.value }
  delete nextCharts[activeChartKey.value]

  const nextActive = nextCharts.primary
    ? 'primary'
    : Object.keys(nextCharts)[0]

  if (!nextActive) {
    return
  }

  depthCharts.value = nextCharts
  activeChartKey.value = nextActive

  persistDepthChart().catch(() => {
    depthCharts.value = previous
    activeChartKey.value = previousActive
  })
}

function clearActiveChart() {
  if (!isEditable) {
    return
  }

  const previous = JSON.parse(JSON.stringify(depthCharts.value)) as DepthChartsMap

  depthCharts.value = {
    ...depthCharts.value,
    [activeChartKey.value]: emptyChartConfig(),
  }

  persistDepthChart().catch(() => {
    depthCharts.value = previous
  })
}

async function persistDepthChart() {
  setSaveState('saving')

  try {
    await $fetch('/api/depth-chart', {
      method: 'POST',
      body: {
        depthCharts: depthCharts.value,
      },
    })

    setSaveState('saved')
  } catch {
    setSaveState('error')
    throw new Error('Failed to save depth chart')
  }
}
</script>
