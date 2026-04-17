<script setup lang="ts">
const links = [
  {
    to: '/customer/profile/info',
    label: 'Información personal',
    icon: 'fas fa-user-circle',
  },
  {
    to: '/customer/profile/edit', // Mantenemos la misma ruta para no romper tu router
    label: 'Seguridad',
    icon: 'fas fa-shield-alt',
  },
]
</script>

<template>
  <aside class="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:max-w-60 h-fit">
    <h3 class="mb-3 px-2 text-sm font-black uppercase tracking-wider text-[#0B369E]">Mi Perfil</h3>

    <nav class="space-y-2">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-gray-500 transition-all hover:bg-blue-50 hover:text-[#0B369E]"
        active-class="bg-[#0B369E] text-white shadow-md hover:bg-[#0B369E] hover:text-white"
      >
        <i :class="link.icon" class="w-5 text-center text-lg"></i>
        <span>{{ link.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>