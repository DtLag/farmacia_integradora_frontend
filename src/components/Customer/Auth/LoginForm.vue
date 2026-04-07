<template>
  <form>
    <div class="mb-4">
      <label for="email" class="block text-gray-700 font-semibold mb-2">Correo Electrónico</label>
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
      <a href="#" class="text-s hover:underline mb-10 inline-block">¿Olvidaste tu contraseña?</a>
    </div>

    <button
      type="submit"
      class="block w-1/3 mx-auto py-2 px-3 text-1xl bg-[#046EB9] text-white font-extralight rounded-2xl hover:bg-[#02416e] transition duration-200"
    >
      Ingresar
    </button>

    <RouterLink
      to="/customer/register"
      class="block w-1/3 mx-auto mt-4 py-2 px-3 text-1xl text-center text-[#205DB3] font-extralight rounded-2xl hover:text-[#002742] transition duration-200"
    >
      Regístrate
    </RouterLink>
  </form>
</template>