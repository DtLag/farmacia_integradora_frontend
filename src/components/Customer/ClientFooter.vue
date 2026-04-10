<template>
  <footer class="bg-gray-900 text-white pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-auto w-full">
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
      <div>
        <h4 class="text-xl font-bold mb-4 flex items-center gap-2">
          <i class="fas fa-clinic-medical text-blue-400"></i> Farmacia
        </h4>
        <p class="text-gray-400 text-sm leading-relaxed">
          Tu salud y bienestar son nuestra prioridad. Encuentra todo lo que necesitas a un clic de distancia y recógelo sin filas.
        </p>
      </div>
      
      <div>
        <h4 class="text-lg font-semibold mb-4 border-b border-gray-700 pb-2 inline-block">Enlaces</h4>
        <ul class="space-y-2 text-sm text-gray-400">
          <li><RouterLink to="/" class="hover:text-blue-400 transition">Inicio</RouterLink></li>
          <li><RouterLink to="/profile" class="hover:text-blue-400 transition">Mi Perfil</RouterLink></li>
          <li><RouterLink to="/cart" class="hover:text-blue-400 transition">Carrito de Compras</RouterLink></li>
        </ul>
      </div>

      <div>
        <h4 class="text-lg font-semibold mb-4 border-b border-gray-700 pb-2 inline-block">Contacto</h4>
        <ul class="space-y-3 text-sm text-gray-400">
          <li class="flex items-center gap-2"><i class="fas fa-map-marker-alt text-blue-400"></i> Av. Principal #123, Centro</li>
          <li class="flex items-center gap-2"><i class="fas fa-phone text-blue-400"></i> (555) 123-4567</li>
          <li class="flex items-center gap-2"><i class="fas fa-envelope text-blue-400"></i> contacto@farmacia.com</li>
        </ul>
      </div>

      <div>
        <h4 class="text-lg font-semibold mb-4 border-b border-gray-700 pb-2 inline-block">Horarios Pick Up</h4>
        <ul class="space-y-2 text-sm text-gray-400">
          <li class="flex justify-between"><span>Lunes - Viernes:</span> <span>8:00 AM - 10:00 PM</span></li>
          <li class="flex justify-between"><span>Sábados:</span> <span>9:00 AM - 8:00 PM</span></li>
          <li class="flex justify-between"><span>Domingos:</span> <span class="text-blue-400">Cerrado</span></li>
        </ul>
      </div>
    </div>
    
    <div class="max-w-7xl mx-auto border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
      &copy; {{ new Date().getFullYear() }} Farmacia. Todos los derechos reservados.
    </div>
  </footer>
</template>