<script setup lang="ts">
import ClientNavbar from '@/components/Customer/ClientNavbar.vue'
import ClientFooter from '@/components/Customer/ClientFooter.vue'
import ProfileSidebar from '@/components/Customer/Profile/ProfileSidebar.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[#EDF7FE]">
    <ClientNavbar />

    <main class="mx-auto w-full max-w-5xl grow p-4 sm:p-6 md:p-10">
      <header class="mb-6 sm:mb-8 text-center sm:text-left">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#1a2b4b]">Seguridad de la Cuenta</h1>
        <p class="mt-2 text-sm sm:text-base text-gray-500">Gestión de privacidad y protección de tus datos.</p>
      </header>

      <div class="grid gap-5 md:grid-cols-[240px_1fr]">
        <ProfileSidebar />

        <div class="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center h-full min-h-[400px] sm:min-h-[500px]">
          
          <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <i class="fas fa-shield-alt text-4xl"></i>
          </div>
          
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-3">Tus datos están protegidos</h2>
          
          <p class="text-gray-500 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
            Por motivos de seguridad y para proteger tu historial médico, la edición de datos personales desde la plataforma web se encuentra deshabilitada.
          </p>
          
          <div class="mt-8 bg-blue-50/50 border border-blue-100 p-4 sm:p-5 rounded-2xl max-w-md w-full">
            <p class="text-sm font-bold text-blue-800 flex items-center justify-center gap-2">
              <i class="fas fa-info-circle text-lg"></i> ¿Necesitas actualizar tu información?
            </p>
            <p class="text-xs sm:text-sm text-gray-600 mt-2 font-medium">
              Por favor, solicita la actualización de tus datos (correo electrónico o teléfono) directamente en el mostrador al recoger tu próximo pedido Pick-Up.
            </p>
          </div>

        </div>

      </div>
    </main>

    <ClientFooter />
  </div>
</template>