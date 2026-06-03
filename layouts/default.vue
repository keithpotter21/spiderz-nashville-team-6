<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <div v-if="!authChecked" class="grid min-h-screen place-items-center px-4">
      <div class="rounded-2xl bg-white px-5 py-4 text-sm text-gray-500 shadow-sm">
        Checking team access...
      </div>
    </div>
    <PasswordGate v-else-if="!authed" />
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
const authed = useState<boolean>('teamAuthed', () => false)
const authChecked = useState<boolean>('teamAuthChecked', () => false)
</script>
