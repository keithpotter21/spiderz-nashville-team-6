<template>
  <div class="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <h2 class="text-xl font-bold">Team Access</h2>
      <p class="mt-1 text-sm text-gray-600">Enter the team password to continue.</p>

      <form class="mt-4 space-y-3" @submit.prevent="submit">
        <input
          v-model="password"
          type="password"
          class="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
          placeholder="Team password"
          autocomplete="current-password"
        />

        <button
          class="w-full rounded-xl bg-black px-4 py-3 text-white disabled:opacity-60"
          :disabled="loading || !password"
        >
          {{ loading ? 'Checking…' : 'Enter' }}
        </button>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const password = ref('')
const loading = ref(false)
const error = ref('')
const authed = useState<boolean>('teamAuthed', () => false)
const authChecked = useState<boolean>('teamAuthChecked', () => false)

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { password: password.value },
    })
    authed.value = true
    authChecked.value = true
  } catch {
    error.value = 'Wrong password.'
  } finally {
    loading.value = false
  }
}
</script>
