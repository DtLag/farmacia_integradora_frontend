<script setup lang="ts">
import fondoLogin from '@/assets/img/loginUser/fondologin.png'
import BannerLogin from '@/assets/img/loginUser/bannerlogin.png'

defineProps<{
  tituloLineas: string[]
}>()
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
    
    <div
      class="hidden lg:flex min-h-screen bg-center bg-cover bg-no-repeat items-center"
      :style="{ backgroundImage: `url(${fondoLogin})` }"
    >
      <div
        class="w-full py-16 bg-cover bg-no-repeat flex items-center justify-end pr-10"
        :style="{ backgroundImage: `url(${BannerLogin})` }"
      >
        <p class="text-5xl text-right text-white font-extrabold leading-tight">
          <span class="block">FARMACIA</span>
          <span class="block">DR. PEREZ</span>
        </p>
      </div>
    </div>

    <div class="flex items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen">
      
      <div class="bg-[#C1DFF5] w-full max-w-xl p-8 sm:p-10 rounded-2xl shadow-lg">
        
        <p class="text-4xl sm:text-5xl lg:text-6xl text-center text-black font-bold leading-tight mb-8">
          <span v-for="(linea, i) in tituloLineas" :key="i" class="block">{{ linea }}</span>
        </p>

        <slot />
        
      </div>
    </div>
    
  </div>
</template>