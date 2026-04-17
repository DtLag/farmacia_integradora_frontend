<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useApi } from '@/composables/useApiFetch'
import { useAuthStore } from '@/stores/auth'

interface StaffRole {
  id?: number
  name?: string
  slug?: string
}

interface StaffApiItem {
  id: number
  name: string
  last_name: string
  email: string
  user_id?: string
  deleted_at?: string | null
  role_id?: number
  role?: string | StaffRole
  status?: string
  active?: boolean
  is_active?: boolean
  sales_today?: number
  last_access?: string
}

interface PermissionGroup {
  title: string
  items: { name: string; allowed: boolean }[]
}

interface UserCardData {
  id: number
  firstName: string
  lastName: string
  fullName: string
  email: string
  code: string
  initials: string
  role: string
  roleId: number
  roleSlug: 'admin' | 'vendedor'
  status: 'Activo' | 'Inactivo'
  accent: string
  lastAccess: string
  salesToday: string
  permissions: PermissionGroup[]
}

type FilterKey = 'Todos' | 'Administradores' | 'Empleados' | 'Inactivos'

const authStore = useAuthStore()
const searchQuery = ref('')
const activeFilter = ref<FilterKey>('Todos')
const selectedUserId = ref<number | null>(null)
const users = ref<UserCardData[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isCreateModalOpen = ref(false)
const isSavingEdit = ref(false)
const isSavingCreate = ref(false)
const isChangingStatus = ref(false)

const filterOptions: FilterKey[] = ['Todos', 'Administradores', 'Empleados', 'Inactivos']
const accentPalette = ['#f97316', '#0f766e', '#2563eb', '#eab308', '#ef4444', '#8b5cf6']

const createForm = reactive({ name: '', last_name: '', email: '', user_id: '', password: '', role_id: 2 })
const editForm = reactive({ id: 0, name: '', last_name: '', email: '', role_id: 2, password: '' })

const totalUsers = computed(() => users.value.length)
const adminUsers = computed(() => users.value.filter((user) => user.roleSlug === 'admin').length)
const employeeUsers = computed(() => users.value.filter((user) => user.roleSlug === 'vendedor' && user.status === 'Activo').length)
const inactiveUsers = computed(() => users.value.filter((user) => user.status === 'Inactivo').length)

const filteredUsers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return users.value.filter((user) => {
    const matchesQuery =
      !query ||
      user.fullName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.code.toLowerCase().includes(query)

    const matchesFilter =
      activeFilter.value === 'Todos' ||
      (activeFilter.value === 'Administradores' && user.roleSlug === 'admin') ||
      (activeFilter.value === 'Empleados' && user.roleSlug === 'vendedor' && user.status === 'Activo') ||
      (activeFilter.value === 'Inactivos' && user.status === 'Inactivo')

    return matchesQuery && matchesFilter
  })
})

const selectedUser = computed(() => {
  if (!filteredUsers.value.length) return null
  return filteredUsers.value.find((user) => user.id === selectedUserId.value) ?? filteredUsers.value[0] ?? null
})

watch(filteredUsers, (nextUsers) => {
  if (!nextUsers.length) {
    selectedUserId.value = null
    return
  }
  if (!nextUsers.some((user) => user.id === selectedUserId.value)) {
    selectedUserId.value = nextUsers[0]?.id ?? null
  }
})

onMounted(loadUsers)

watch(selectedUser, (user) => {
  if (!user) return
  syncEditForm(user)
}, { immediate: true })

async function loadUsers() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const { data, error } = await useApi('/staff').get().json()
    if (error.value) {
      errorMessage.value = 'No se pudo cargar la lista de staff.'
      users.value = []
      return
    }
    const payload = (data.value?.data ?? data.value ?? []) as StaffApiItem[]
    users.value = payload.map((item, index) => normalizeUser(item, index))
    selectedUserId.value = users.value[0]?.id ?? null
  } catch (error) {
    console.error('Error cargando usuarios:', error)
    errorMessage.value = 'Ocurrio un error al cargar el staff.'
    users.value = []
  } finally {
    isLoading.value = false
  }
}

function normalizeUser(user: StaffApiItem, index: number): UserCardData {
  const role = getRoleName(user)
  const roleId = typeof user.role_id === 'number' && user.role_id > 0 ? user.role_id : role === 'Administrador' ? 1 : 2
  const roleSlug = roleId === 1 ? 'admin' : 'vendedor'
  const status = getStatus(user)
  return {
    id: user.id,
    firstName: user.name ?? '',
    lastName: user.last_name ?? '',
    fullName: `${user.name ?? ''} ${user.last_name ?? ''}`.trim() || `Usuario ${user.id}`,
    email: user.email || 'sin-correo@farmacia.local',
    code: String(user.user_id || `STAFF-${user.id}`),
    initials: `${(user.name ?? '').charAt(0)}${(user.last_name ?? '').charAt(0)}`.toUpperCase() || 'ST',
    role,
    roleId,
    roleSlug,
    status,
    accent: accentPalette[index % accentPalette.length] ?? '#2563eb',
    lastAccess: user.last_access?.trim() || 'Sin registro',
    salesToday: typeof user.sales_today === 'number' ? `${user.sales_today} ventas` : 'Sin dato',
    permissions: buildPermissions(roleSlug, status),
  }
}

function getRoleName(user: StaffApiItem) {
  if (typeof user.role === 'object') {
    const source = `${user.role.slug ?? ''} ${user.role.name ?? ''}`.toLowerCase()
    if (source.includes('admin')) return 'Administrador'
    if (source.includes('vend') || source.includes('emple')) return 'Empleado'
    if (user.role.name?.trim()) return user.role.name.trim()
  }
  if (typeof user.role === 'string') {
    const value = user.role.trim().toLowerCase()
    if (value.includes('admin')) return 'Administrador'
    if (value.includes('vend') || value.includes('emple')) return 'Empleado'
  }
  return user.role_id === 1 ? 'Administrador' : 'Empleado'
}

function getStatus(user: StaffApiItem): 'Activo' | 'Inactivo' {
  if (user.deleted_at) return 'Inactivo'
  if (typeof user.status === 'string') return user.status.toLowerCase().includes('inac') ? 'Inactivo' : 'Activo'
  if (typeof user.active === 'boolean') return user.active ? 'Activo' : 'Inactivo'
  if (typeof user.is_active === 'boolean') return user.is_active ? 'Activo' : 'Inactivo'
  return 'Activo'
}

function buildPermissions(roleSlug: 'admin' | 'vendedor', status: 'Activo' | 'Inactivo'): PermissionGroup[] {
  const isAdmin = roleSlug === 'admin'
  const isActive = status === 'Activo'
  return [
    { title: 'Operación', items: [{ name: 'Registrar ventas', allowed: isActive }, { name: 'Procesar pedidos', allowed: isActive }] },
    { title: 'Inventario', items: [{ name: 'Consultar stock', allowed: isActive }, { name: 'Ajustar inventario', allowed: isAdmin && isActive }] },
    { title: 'Administración', items: [{ name: 'Gestionar usuarios', allowed: isAdmin && isActive }, { name: 'Ver auditoría', allowed: isAdmin && isActive }] },
  ]
}

function selectUser(userId: number) {
  selectedUserId.value = userId
  // Si estamos en móvil, scrollear suavemente a los detalles
  if(window.innerWidth < 1024) {
    setTimeout(() => {
        document.getElementById('user-details-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }
}

function buildUserCode() {
  return `STAFF${Date.now().toString().slice(-6)}`
}

function openCreateModal() {
  errorMessage.value = ''
  successMessage.value = ''
  Object.assign(createForm, { name: '', last_name: '', email: '', user_id: buildUserCode(), password: '', role_id: 2 })
  isCreateModalOpen.value = true
}

function closeCreateModal() {
  if (!isSavingCreate.value) isCreateModalOpen.value = false
}

function syncEditForm(user: UserCardData) {
  Object.assign(editForm, {
    id: user.id,
    name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    role_id: user.roleId,
    password: '',
  })
}

function resetEditForm() {
  if (!selectedUser.value) return
  syncEditForm(selectedUser.value)
}

async function submitCreate() {
  isSavingCreate.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await createStaff({
      name: createForm.name.trim(),
      last_name: createForm.last_name.trim(),
      email: createForm.email.trim(),
      user_id: createForm.user_id.trim().toUpperCase(),
      password: createForm.password.trim(),
      role_id: Number(createForm.role_id),
    })
    successMessage.value = 'Usuario creado correctamente.'
    isCreateModalOpen.value = false
    await loadUsers()
  } catch (error) {
    console.error('Error creando usuario:', error)
    errorMessage.value = getErrorMessage(error, 'No se pudo crear el usuario.')
  } finally {
    isSavingCreate.value = false
  }
}

async function submitEdit() {
  if (!editForm.id) return
  isSavingEdit.value = true
  errorMessage.value = ''
  successMessage.value = ''
  const payload: Record<string, unknown> = {
    name: editForm.name.trim(),
    last_name: editForm.last_name.trim(),
    email: editForm.email.trim(),
    role: editForm.role_id === 1 ? 'admin' : 'vendedor',
  }
  if (editForm.password.trim()) payload.password = editForm.password.trim()
  try {
    await patchStaff(editForm.id, payload)
    successMessage.value = 'Usuario actualizado correctamente.'
    await loadUsers()
    selectedUserId.value = editForm.id
  } catch (error) {
    console.error('Error actualizando usuario:', error)
    errorMessage.value = getErrorMessage(error, 'No se pudo actualizar el usuario.')
  } finally {
    isSavingEdit.value = false
  }
}

async function disableSelectedUser() {
  if (!selectedUser.value || isChangingStatus.value) return

  errorMessage.value = ''
  successMessage.value = ''

  isChangingStatus.value = true

  try {
    if (selectedUser.value.status === 'Inactivo') {
      await restoreStaff(selectedUser.value.id)
      successMessage.value = 'Usuario habilitado correctamente.'
      activeFilter.value = 'Todos'
    } else {
      await softDeleteStaff(selectedUser.value.id)
      successMessage.value = 'Usuario deshabilitado correctamente.'
      activeFilter.value = 'Inactivos'
    }

    await loadUsers()
  } catch (error) {
    console.error('Error cambiando estado del usuario:', error)
    errorMessage.value = getErrorMessage(
      error,
      selectedUser.value.status === 'Inactivo'
        ? 'No se pudo habilitar el usuario.'
        : 'No se pudo deshabilitar el usuario.',
    )
  } finally {
    isChangingStatus.value = false
  }
}

async function createStaff(payload: Record<string, unknown>) {
  ensureAuthenticated()
  const { data, error } = await useApi('/register/staff').post(payload).json()
  if (error.value) throw new Error(extractApiMessage(error.value, 'No se pudo crear el usuario.'))
  return data.value
}

async function patchStaff(userId: number, payload: Record<string, unknown>) {
  ensureAuthenticated()
  const { data, error } = await useApi(`/users/${userId}`).put(payload).json()
  if (error.value) throw new Error(extractApiMessage(error.value, 'No se pudo actualizar el usuario.'))
  return data.value
}

async function softDeleteStaff(userId: number) {
  ensureAuthenticated()
  const { data, error } = await useApi(`/users/${userId}`).delete().json()
  if (error.value) throw new Error(extractApiMessage(error.value, 'No se pudo deshabilitar el usuario.'))
  return data.value
}

async function restoreStaff(userId: number) {
  ensureAuthenticated()
  const { data, error } = await useApi(`/users/${userId}/restore`).post({}).json()
  if (error.value) throw new Error(extractApiMessage(error.value, 'No se pudo habilitar el usuario.'))
  return data.value
}

function ensureAuthenticated() {
  if (!authStore.token) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión para administrar usuarios.')
}

function extractApiMessage(error: unknown, fallback: string) {
  if (typeof error !== 'object' || error === null) return fallback
  const response = error as { message?: string; data?: { message?: string; errors?: Record<string, string[]> } }
  const details = response.data?.errors ? Object.values(response.data.errors).flat().join(' ') : ''
  return response.data?.message || response.message || details || fallback
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback
  const message = error.message.toLowerCase()
  if (message.includes('unauthenticated')) return 'Tu sesión ya no es válida. Cierra sesión y vuelve a entrar.'
  if (message.includes('403') || message.includes('forbidden')) return 'No tienes permisos para realizar esta acción.'
  if (message.includes('422') || message.includes('validation')) return 'El formulario contiene errores. Verifica la información (correo único, contraseña mín. 8 caracteres, etc).'
  return error.message || fallback
}
</script>

<template>
  <div class="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 p-4 sm:p-6 lg:p-8">
    
    <div class="max-w-[1500px] mx-auto flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-7rem)]">
      
      <aside class="w-full lg:w-5/12 bg-white/90 backdrop-blur-sm rounded-[28px] shadow-sm border border-gray-200 p-5 sm:p-6 flex flex-col h-[600px] lg:h-full shrink-0">
        
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <p class="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-blue-700 mb-1">Panel de staff</p>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Usuarios del sistema</h1>
          </div>
          <button class="w-full sm:w-auto bg-[#0B369E] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95" @click="openCreateModal">
            <i class="fas fa-plus"></i> Nuevo staff
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <article class="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100">
            <span class="block text-[10px] uppercase font-bold text-blue-700">Total</span>
            <strong class="block text-2xl font-black text-gray-900 mt-1">{{ totalUsers }}</strong>
          </article>
          <article class="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100">
            <span class="block text-[10px] uppercase font-bold text-emerald-700">Admins</span>
            <strong class="block text-2xl font-black text-gray-900 mt-1">{{ adminUsers }}</strong>
          </article>
          <article class="p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100">
            <span class="block text-[10px] uppercase font-bold text-purple-700">Empleados</span>
            <strong class="block text-2xl font-black text-gray-900 mt-1">{{ employeeUsers }}</strong>
          </article>
          <article class="p-3 rounded-2xl bg-gradient-to-br from-rose-50 to-white border border-rose-100">
            <span class="block text-[10px] uppercase font-bold text-rose-700">Inactivos</span>
            <strong class="block text-2xl font-black text-gray-900 mt-1">{{ inactiveUsers }}</strong>
          </article>
        </div>

        <div v-if="successMessage" class="px-4 py-3 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm mb-4 border border-emerald-200">
          <i class="fas fa-check-circle"></i> {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="px-4 py-3 rounded-xl bg-rose-100 text-rose-800 font-bold text-sm mb-4 border border-rose-200">
          <i class="fas fa-exclamation-triangle"></i> {{ errorMessage }}
        </div>

        <div class="relative mb-4">
          <input v-model="searchQuery" type="text" placeholder="Buscar por nombre, correo o clave..." class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#0B369E] transition-all text-sm" />
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>

        <div class="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          <button
            v-for="filter in filterOptions"
            :key="filter"
            class="px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap"
            :class="activeFilter === filter ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'"
            @click="activeFilter = filter"
          >
            {{ filter }}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
          <div v-if="isLoading" class="text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500 font-medium">
            <i class="fas fa-spinner animate-spin text-2xl mb-2 text-blue-500"></i><br> Cargando staff...
          </div>
          <div v-else-if="filteredUsers.length === 0" class="text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500 font-medium">
            <i class="fas fa-users-slash text-2xl mb-2 text-gray-400"></i><br> No se encontraron usuarios.
          </div>
          
          <button
            v-for="user in filteredUsers"
            v-else
            :key="user.id"
            type="button"
            class="w-full text-left p-4 border rounded-2xl bg-white transition-all duration-200"
            :class="selectedUser?.id === user.id ? 'border-l-4 shadow-md bg-blue-50/30 ring-1 ring-blue-100' : 'border-gray-100 border-l-4 border-l-transparent hover:shadow-sm'"
            :style="{ borderLeftColor: selectedUser?.id === user.id ? user.accent : 'transparent' }"
            @click="selectUser(user.id)"
          >
            <div class="flex items-center gap-4 mb-3">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-sm" :style="{ backgroundColor: user.accent }">
                {{ user.initials }}
              </div>
              <div class="flex-grow min-w-0">
                <strong class="block text-gray-900 truncate">{{ user.fullName }}</strong>
                <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
              </div>
              <div class="w-3 h-3 rounded-full shrink-0" :class="user.status === 'Activo' ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-rose-500 ring-4 ring-rose-500/20'"></div>
            </div>
            <div class="flex flex-wrap gap-2 mb-3">
              <span class="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider">{{ user.role }}</span>
              <span class="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider">{{ user.code }}</span>
            </div>
            <div class="flex justify-between items-center text-[10px] sm:text-xs text-gray-400 font-medium">
              <span><i class="fas fa-chart-line mr-1"></i> {{ user.salesToday }}</span>
              <span><i class="fas fa-clock mr-1"></i> {{ user.lastAccess }}</span>
            </div>
          </button>
        </div>
      </aside>

      <section id="user-details-section" class="w-full lg:w-7/12 flex flex-col h-auto lg:h-full overflow-hidden shrink-0">
        
        <div v-if="selectedUser" class="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pr-1 sm:pr-2 pb-6 lg:pb-0">
          
          <article class="p-6 sm:p-8 rounded-[28px] text-white shadow-lg relative overflow-hidden" :style="{ background: `linear-gradient(145deg, ${selectedUser.accent}, #1a2b4b 80%)` }">
            <div class="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p class="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/70 mb-1">Ficha seleccionada</p>
                <h2 class="text-2xl sm:text-3xl font-black mb-1">{{ selectedUser.fullName }}</h2>
                <p class="text-sm font-medium text-white/90"><i class="fas fa-id-badge mr-1"></i> {{ selectedUser.role }} &bull; {{ selectedUser.email }}</p>
              </div>
              <div class="flex gap-2 w-full sm:w-auto">
                <button class="flex-1 sm:flex-none px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold backdrop-blur-md transition" @click="resetEditForm">
                  <i class="fas fa-undo"></i>
                </button>
                <button
                  class="flex-[2] sm:flex-none px-4 py-2 rounded-xl text-sm font-bold shadow-md transition"
                  :class="selectedUser.status === 'Inactivo' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'"
                  :disabled="isChangingStatus"
                  @click="disableSelectedUser"
                >
                  <i class="fas" :class="selectedUser.status === 'Inactivo' ? 'fa-check' : 'fa-ban'"></i> 
                  {{ isChangingStatus ? 'Procesando...' : (selectedUser.status === 'Inactivo' ? 'Habilitar' : 'Deshabilitar') }}
                </button>
              </div>
            </div>
            
            <div class="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
              <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <span class="block text-[10px] uppercase font-bold text-white/60 mb-1">Rol backend</span>
                <strong class="text-sm sm:text-base">{{ selectedUser.roleSlug }}</strong>
              </div>
              <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <span class="block text-[10px] uppercase font-bold text-white/60 mb-1">Estado</span>
                <strong class="text-sm sm:text-base flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full" :class="selectedUser.status === 'Activo' ? 'bg-emerald-400' : 'bg-rose-400'"></span> {{ selectedUser.status }}
                </strong>
              </div>
              <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <span class="block text-[10px] uppercase font-bold text-white/60 mb-1">Clave</span>
                <strong class="text-sm sm:text-base">{{ selectedUser.code }}</strong>
              </div>
              <div class="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <span class="block text-[10px] uppercase font-bold text-white/60 mb-1">Actividad Hoy</span>
                <strong class="text-sm sm:text-base">{{ selectedUser.salesToday }}</strong>
              </div>
            </div>
          </article>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            <div class="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200">
              <h3 class="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2"><i class="fas fa-info-circle text-blue-500 mr-2"></i> Resumen operativo</h3>
              <dl class="space-y-3">
                <div class="flex flex-col"><dt class="text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre completo</dt><dd class="text-sm font-semibold text-gray-900 mt-0.5">{{ selectedUser.fullName }}</dd></div>
                <div class="flex flex-col"><dt class="text-xs font-bold text-gray-400 uppercase tracking-wider">Correo registrado</dt><dd class="text-sm font-semibold text-gray-900 mt-0.5">{{ selectedUser.email }}</dd></div>
                <div class="flex flex-col"><dt class="text-xs font-bold text-gray-400 uppercase tracking-wider">Clave de acceso</dt><dd class="text-sm font-semibold text-gray-900 mt-0.5">{{ selectedUser.code }}</dd></div>
                <div class="flex flex-col"><dt class="text-xs font-bold text-gray-400 uppercase tracking-wider">Último acceso al sistema</dt><dd class="text-sm font-semibold text-gray-900 mt-0.5">{{ selectedUser.lastAccess }}</dd></div>
              </dl>
            </div>

            <div class="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200">
              <h3 class="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2"><i class="fas fa-user-edit text-blue-500 mr-2"></i> Editar usuario</h3>
              <form class="space-y-3" @submit.prevent="submitEdit">
                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1"><label class="text-xs font-bold text-gray-500">Nombre</label><input v-model="editForm.name" type="text" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                    <div class="space-y-1"><label class="text-xs font-bold text-gray-500">Apellido</label><input v-model="editForm.last_name" type="text" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                </div>
                <div class="space-y-1"><label class="text-xs font-bold text-gray-500">Email</label><input v-model="editForm.email" type="email" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                <div class="space-y-1"><label class="text-xs font-bold text-gray-500">Rol</label><select v-model.number="editForm.role_id" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"><option :value="1">Administrador</option><option :value="2">Empleado</option></select></div>
                <div class="space-y-1"><label class="text-xs font-bold text-gray-500">Nueva contraseña</label><input v-model="editForm.password" type="password" minlength="8" placeholder="Opcional..." class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                <button type="submit" :disabled="isSavingEdit" class="w-full mt-2 bg-[#0B369E] hover:bg-blue-800 text-white py-2.5 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 shadow-md">
                  {{ isSavingEdit ? 'Guardando...' : 'Guardar cambios' }}
                </button>
              </form>
            </div>

            <div class="md:col-span-2 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200">
              <h3 class="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2"><i class="fas fa-key text-blue-500 mr-2"></i> Matriz de Permisos (Calculados)</h3>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <section v-for="group in selectedUser.permissions" :key="group.title" class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 class="font-bold text-gray-800 text-sm mb-3">{{ group.title }}</h4>
                  <div v-for="permission in group.items" :key="permission.name" class="flex justify-between items-center mb-2 last:mb-0">
                    <span class="text-xs font-medium text-gray-600">{{ permission.name }}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="permission.allowed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                      {{ permission.allowed ? 'Permitido' : 'Restringido' }}
                    </span>
                  </div>
                </section>
              </div>
            </div>

          </div>
        </div>

        <div v-else class="h-[300px] lg:h-full flex flex-col items-center justify-center text-center p-8 bg-white/60 rounded-[28px] border-2 border-dashed border-gray-200">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <i class="fas fa-hand-pointer text-3xl text-gray-400"></i>
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">Selecciona un usuario</h2>
          <p class="text-gray-500 text-sm max-w-xs">Haz clic en una de las tarjetas de la izquierda para ver y editar los detalles del empleado.</p>
        </div>

      </section>
    </div>

    <div v-if="isCreateModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" @click.self="closeCreateModal">
      <div class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Alta de staff</p>
            <h3 class="text-xl font-bold text-gray-900">Registrar nuevo usuario</h3>
          </div>
          <button class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition-colors" @click="closeCreateModal"><i class="fas fa-times"></i></button>
        </div>

        <form class="p-6" @submit.prevent="submitCreate">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div class="space-y-1.5"><label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Nombre</label><input v-model="createForm.name" type="text" required class="w-full px-4 py-2.5 bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"/></div>
            <div class="space-y-1.5"><label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Apellido</label><input v-model="createForm.last_name" type="text" required class="w-full px-4 py-2.5 bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"/></div>
            <div class="space-y-1.5"><label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Email</label><input v-model="createForm.email" type="email" required class="w-full px-4 py-2.5 bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"/></div>
            <div class="space-y-1.5"><label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Clave Acceso</label><input v-model="createForm.user_id" type="text" required class="w-full px-4 py-2.5 bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"/></div>
            <div class="space-y-1.5"><label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Contraseña</label><input v-model="createForm.password" type="password" minlength="8" required class="w-full px-4 py-2.5 bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"/></div>
            <div class="space-y-1.5"><label class="text-xs font-bold text-gray-600 uppercase tracking-wider">Rol</label><select v-model.number="createForm.role_id" class="w-full px-4 py-2.5 bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"><option :value="1">Administrador</option><option :value="2">Empleado</option></select></div>
          </div>
          
          <div class="mt-8 flex gap-3 pt-6 border-t border-gray-100">
            <button type="button" class="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors" @click="closeCreateModal">Cancelar</button>
            <button type="submit" class="flex-[2] py-3 rounded-xl bg-[#0B369E] hover:bg-blue-800 text-white font-bold shadow-md transition-colors disabled:opacity-50" :disabled="isSavingCreate">{{ isSavingCreate ? 'Guardando...' : 'Crear usuario' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-thin::-webkit-scrollbar { width: 6px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.3); border-radius: 20px; }
</style>