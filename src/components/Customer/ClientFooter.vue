<template>
  <footer class="bg-[#0B369E] text-white pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-auto w-full">
    <div class="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-8 text-center sm:text-left">
      <div class="flex flex-col items-center sm:items-start">
        <h4 class="text-xl font-bold mb-4 flex items-center gap-2">
          <i class="fas fa-clinic-medical text-blue-400"></i> Farmacia
        </h4>
        <p class="text-gray-400 text-sm leading-relaxed max-w-xs sm:max-w-none">
          Tu salud y bienestar son nuestra prioridad. Encuentra todo lo que necesitas a un clic de distancia y recógelo sin filas.
        </p>
      </div>
      
      <div class="flex flex-col items-center sm:items-start">
        <h4 class="text-lg font-semibold mb-4 border-b border-gray-700 pb-2 inline-block">Enlaces</h4>
        <ul class="space-y-3 text-sm text-gray-400">
          <li><RouterLink to="/" class="hover:text-blue-400 transition">Inicio</RouterLink></li>
          <li><RouterLink to="/customer/profile/info" class="hover:text-blue-400 transition">Mi Perfil</RouterLink></li>
          <li><RouterLink to="/customer/cart" class="hover:text-blue-400 transition">Carrito de Compras</RouterLink></li>
        </ul>
      </div>

      <div class="flex flex-col items-center sm:items-start">
        <h4 class="text-lg font-semibold mb-4 border-b border-gray-700 pb-2 inline-block">Contacto</h4>
        <ul class="space-y-3 text-sm text-gray-400">
          <li class="flex items-center justify-center sm:justify-start gap-3">
            <i class="fas fa-map-marker-alt text-blue-400 w-4 text-center"></i> Av. Principal #123, Centro
          </li>
          <li class="flex items-center justify-center sm:justify-start gap-3">
            <i class="fas fa-phone text-blue-400 w-4 text-center"></i> (555) 123-4567
          </li>
          <li class="flex items-center justify-center sm:justify-start gap-3">
            <i class="fas fa-envelope text-blue-400 w-4 text-center"></i> contacto@farmacia.com
          </li>
        </ul>
      </div>

      <div class="flex flex-col items-center sm:items-start">
        <h4 class="text-lg font-semibold mb-4 border-b border-gray-700 pb-2 inline-block">Horarios Pick Up</h4>
        <ul class="space-y-2 text-sm text-gray-400 w-full max-w-[200px] sm:max-w-none">
          <li class="flex justify-between border-b border-blue-900/50 pb-1"><span>Lunes - Viernes:</span> <span>8:00 AM - 10:00 PM</span></li>
          <li class="flex justify-between border-b border-blue-900/50 pb-1"><span>Sábados:</span> <span>9:00 AM - 8:00 PM</span></li>
          <li class="flex justify-between"><span>Domingos:</span> <span class="text-blue-400 font-medium">Cerrado</span></li>
        </ul>
      </div>
    </div>
    
    <div class="max-w-7xl mx-auto border-t border-blue-900 pt-6 text-center text-xs text-gray-400">
      &copy; {{ new Date().getFullYear() }} Farmacia. Todos los derechos reservados.
    </div>
  </footer>
</template>