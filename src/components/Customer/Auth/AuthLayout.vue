<script setup lang="ts">
import fondoLogin from '@/assets/img/loginUser/fondologin.png'
import BannerLogin from '@/assets/img/loginUser/bannerlogin.png'

defineProps<{
  tituloLineas: string[]
}>()
</script>

<template>
  <div class="grid grid-cols-2">
    <div
      class="h-screen bg-center bg-cover bg-no-repeat flex items-center"
      :style="{ backgroundImage: `url(${fondoLogin})` }"
    >
      <div
        class="w-full h-1/3 bg-cover bg-no-repeat flex items-center justify-end pr-10"
        :style="{ backgroundImage: `url(${BannerLogin})` }"
      >
        <p class="text-5xl text-center text-white font-extrabold leading-tight">
          <span class="block">FARMACIA</span>
          <span class="block">DR. PEREZ</span>
        </p>
      </div>
    </div>

    <div class="h-screen flex items-center py-10">
      <div class="bg-[#C1DFF5] w-full h-11/12 mx-24 my-24 p-10 rounded-lg shadow-lg">
        <p class="text-6xl text-center text-black font-bold leading-tight mb-10">
          <span v-for="(linea, i) in tituloLineas" :key="i" class="block">{{ linea }}</span>
        </p>

        <slot />
      </div>
    </div>
  </div>
</template>