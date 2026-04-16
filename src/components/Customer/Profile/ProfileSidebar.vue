<script setup lang="ts">
const links = [
  {
    to: '/customer/profile/info',
    label: 'Informacion personal',
    icon: 'fas fa-user-circle',
  },
  {
    to: '/customer/profile/edit',
    label: 'Editar perfil',
    icon: 'fas fa-user-pen',
  },
]
</script>

<template>
  <aside class="w-full rounded-2xl border bg-white p-4 shadow-sm md:max-w-60">
    <h3 class="mb-3 px-2 text-sm font-black uppercase tracking-wider text-[#0B369E]">Perfil</h3>

    <nav class="space-y-2">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-[#0B369E]"
        active-class="bg-[#0B369E] text-white shadow-md"
      >
        <i :class="link.icon" class="w-4 text-center"></i>
        <span>{{ link.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>
