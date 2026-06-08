<template>
  <section class="mt-6 rounded-[2rem] border border-slate-200/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 class="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
          Batting Order
        </h2>
      </div>

      <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <span v-if="!isEditable">Read only</span>
        <span v-else-if="saveState === 'saving'">Saving lineup...</span>
        <span v-else-if="saveState === 'saved'">Lineup saved</span>
        <span v-else-if="saveState === 'error'" class="text-red-600">Save failed</span>
        <span v-else>{{ lineup.length }} total hitters</span>
      </div>
    </div>

    <div class="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-slate-950 text-left text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
            <tr>
              <th class="px-4 py-4">Order</th>
              <th class="min-w-[300px] px-4 py-4">Player</th>
              <th class="px-4 py-4">Speed</th>
              <th class="px-4 py-4">Order</th>
              <th class="px-4 py-4">Power</th>
              <th class="px-4 py-4">Walk?</th>
              <th class="px-4 py-4">Will Run</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="(entry, index) in lineup"
              :key="entry.name"
              :draggable="isEditable"
              class="bg-white transition hover:bg-slate-50"
              :class="{
                'cursor-grab': isEditable,
                'opacity-50': draggingIndex === index,
                'bg-amber-50': dropIndex === index && draggingIndex !== null && draggingIndex !== index,
              }"
              @dragstart="isEditable && onDragStart(index)"
              @dragover.prevent="isEditable && onDragOver(index)"
              @drop.prevent="isEditable && onDrop(index)"
              @dragend="isEditable && onDragEnd()"
            >
              <td class="px-4 py-4 align-middle">
                <div class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-900">
                  {{ index + 1 }}
                </div>
              </td>

              <td class="min-w-[300px] px-4 py-4 align-middle">
                <div class="flex flex-wrap items-center gap-2">
                  <div
                    class="font-bold"
                    :class="entry.sex === 'F' ? 'text-rose-600' : 'text-slate-900'"
                  >
                    {{ entry.name }}
                  </div>
                  <span v-if="entry.needRunner === 'Yes'" class="text-base" title="Needs runner" aria-label="Needs runner">
                    🏃🏻
                  </span>
                </div>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    Bats: {{ entry.batSide || '—' }}
                  </span>
                  <span class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {{ entry.hitterType || '—' }}
                  </span>
                </div>
              </td>

              <td class="px-4 py-4 align-middle text-sm font-semibold text-slate-700">
                {{ entry.speed ?? '—' }}
              </td>

              <td class="px-4 py-4 align-middle text-sm text-slate-600">
                {{ entry.lineupPosition || '—' }}
              </td>

              <td class="px-4 py-4 align-middle text-sm text-slate-600">
                {{ entry.powerRating ?? '—' }}
              </td>

              <td class="px-4 py-4 align-middle text-sm text-slate-600">
                {{ entry.takeWalk || '—' }}
              </td>

              <td class="px-4 py-4 align-middle text-sm text-slate-600">
                {{ entry.beRunner || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import lineupData from '~/assets/data/lineup.json'
import rosterData from '~/assets/data/roster.json'

type LineupEntry = {
  name: string
  sex: string
  speed: number
  needRunner: string
  beRunner: string
  batSide: string
  lineupPosition: string
  hitterType: string
  powerRating: number
  homeRuns: string
  takeWalk: string
  gentlemenQuestion?: string
}

type SavedLineup = {
  lineup1?: Record<string, string>
}

const lineupSlots = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const
const isEditable = import.meta.dev
const lineupResponse = isEditable
  ? await useFetch<LineupEntry[]>('/api/lineup')
  : { data: ref<LineupEntry[] | null>(null) }

const roster = rosterData as LineupEntry[]

function buildLineupFromSavedData(saved: SavedLineup | null | undefined) {
  const lineup1 = saved?.lineup1 || {}
  const rosterByName = new Map(roster.map((player) => [player.name, player]))
  const savedPlayers = lineupSlots
    .map((slot) => lineup1[slot])
    .filter((name): name is string => typeof name === 'string' && name.length > 0 && rosterByName.has(name))
    .map((name) => ({ ...rosterByName.get(name)! }))

  const usedNames = new Set(savedPlayers.map((player) => player.name))
  const remainingPlayers = roster
    .filter((player) => !usedNames.has(player.name))
    .map((player) => ({ ...player }))

  return [...savedPlayers, ...remainingPlayers]
}

const lineup = ref<LineupEntry[]>(
  isEditable
    ? (Array.isArray(lineupResponse.data.value) ? lineupResponse.data.value.map((entry) => ({ ...entry })) : [])
    : buildLineupFromSavedData(lineupData as SavedLineup)
)

const draggingIndex = ref<number | null>(null)
const dropIndex = ref<number | null>(null)
const saveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
let saveStateTimer: ReturnType<typeof setTimeout> | null = null

watch(lineupResponse.data, (nextValue) => {
  if (!isEditable) {
    return
  }

  if (Array.isArray(nextValue)) {
    lineup.value = nextValue.map((entry) => ({ ...entry }))
  }
})

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

function moveItem(from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= lineup.value.length || to >= lineup.value.length) {
    return
  }

  const next = [...lineup.value]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  lineup.value = next
}

async function persistLineup() {
  setSaveState('saving')

  try {
    await $fetch('/api/lineup', {
      method: 'POST',
      body: {
        lineup: lineup.value,
      },
    })

    setSaveState('saved')
  } catch {
    setSaveState('error')
    throw new Error('Failed to save lineup')
  }
}

function onDragStart(index: number) {
  draggingIndex.value = index
  dropIndex.value = index
}

function onDragOver(index: number) {
  dropIndex.value = index
}

async function onDrop(index: number) {
  if (!isEditable) {
    return
  }

  if (draggingIndex.value === null) {
    return
  }

  const previous = lineup.value.map((entry) => ({ ...entry }))
  moveItem(draggingIndex.value, index)

  try {
    await persistLineup()
  } catch {
    lineup.value = previous
  } finally {
    onDragEnd()
  }
}

function onDragEnd() {
  draggingIndex.value = null
  dropIndex.value = null
}
</script>
