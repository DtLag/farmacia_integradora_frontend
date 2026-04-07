<script setup lang="ts">
import fondoLogin from '@/assets/img/loginUser/fondologin.png'
import BannerLogin from '@/assets/img/loginUser/bannerlogin.png'
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
          <span class="block">Inicia</span>
          <span class="block">Sesión</span>
        </p>
        <form>
          <div class="mb-4">
            <label for="email" class="block text-gray-700 font-semibold mb-2"
              >Correo Electrónico</label
            >
            <input
              type="email"
              id="email"
              class="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Ingresa tu correo electrónico"
            />
          </div>
          <div class="mb-1">
            <label for="password" class="block text-gray-700 font-semibold mb-2">Contraseña</label>
            <input
              type="password"
              id="password"
              class="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Ingresa tu contraseña"
            />
          </div>
          <div>
            <a href="#" class="text-s hover:underline mb-10   inline-block"
              >¿Olvidaste tu contraseña?</a
            >
          </div>
          <button
            type="submit"
            class="block w-1/3 mx-auto py-2 px-3 text-1xl bg-[#046EB9] text-white font-extralight rounded-2xl hover:bg-[#02416e] transition duration-200"
          >
            Ingresar
          </button>
          <button
            type="button"
            class="block w-1/3 mx-auto mt-4 py-2 px-3 text-1xl text-[#205DB3] font-extralight rounded-2xl hover:text-[#002742] transition duration-200"
            >Registrate</button>
        </form>
      </div>
    </div>
  </div>
</template>
