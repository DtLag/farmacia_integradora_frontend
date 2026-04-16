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
    { title: 'Operacion', items: [{ name: 'Registrar ventas', allowed: isActive }, { name: 'Procesar pedidos', allowed: isActive }] },
    { title: 'Inventario', items: [{ name: 'Consultar stock', allowed: isActive }, { name: 'Ajustar inventario', allowed: isAdmin && isActive }] },
    { title: 'Administracion', items: [{ name: 'Gestionar usuarios', allowed: isAdmin && isActive }, { name: 'Ver auditoria', allowed: isAdmin && isActive }] },
  ]
}

function selectUser(userId: number) {
  selectedUserId.value = userId
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
  if (!authStore.token) throw new Error('Tu sesion expiro. Vuelve a iniciar sesion para administrar usuarios.')
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
  if (message.includes('unauthenticated')) return 'Tu sesion ya no es valida. Cierra sesion y vuelve a entrar para administrar usuarios.'
  if (message.includes('403') || message.includes('forbidden') || message.includes('no autorizado')) {
    return 'El backend actual esta devolviendo 403 para editar o deshabilitar. UserController existe, pero la validacion de admin no coincide con el modelo autenticado.'
  }
  if (message.includes('422') || message.includes('validation')) {
    return 'El backend rechazo los datos. Verifica nombre, apellido, email unico, password minima de 8, user_id unico y role_id valido.'
  }
  return error.message || fallback
}
</script>

<template>
  <div class="users-page">
    <section class="staff-studio">
      <aside class="studio-sidebar">
        <div class="sidebar-head">
          <div>
            <p class="eyebrow">Panel de staff</p>
            <h1>Usuarios del sistema</h1>
            <p class="lead">Selecciona una tarjeta y su ficha aparecera en el panel derecho.</p>
          </div>
          <button class="btn primary" @click="openCreateModal">Nuevo staff</button>
        </div>

        <div class="stats-grid">
          <article><span>Total</span><strong>{{ totalUsers }}</strong></article>
          <article><span>Admins</span><strong>{{ adminUsers }}</strong></article>
          <article><span>Empleados</span><strong>{{ employeeUsers }}</strong></article>
          <article><span>Inactivos</span><strong>{{ inactiveUsers }}</strong></article>
        </div>

        <p v-if="successMessage" class="feedback ok">{{ successMessage }}</p>
        <p v-if="errorMessage" class="feedback error">{{ errorMessage }}</p>
        <input v-model="searchQuery" class="search-input" type="text" placeholder="Buscar por nombre, correo o clave" />

        <div class="filter-row">
          <button
            v-for="filter in filterOptions"
            :key="filter"
            class="pill"
            :class="{ active: activeFilter === filter }"
            @click="activeFilter = filter"
          >
            {{ filter }}
          </button>
        </div>

        <div class="staff-list">
          <p v-if="isLoading" class="panel-message">Cargando staff...</p>
          <p v-else-if="filteredUsers.length === 0" class="panel-message">No se encontraron usuarios.</p>
          <button
            v-for="user in filteredUsers"
            v-else
            :key="user.id"
            type="button"
            class="staff-card"
            :class="{ selected: selectedUser?.id === user.id }"
            :style="{ '--accent': user.accent }"
            @click="selectUser(user.id)"
          >
            <div class="card-top">
              <span class="avatar">{{ user.initials }}</span>
              <div>
                <strong>{{ user.fullName }}</strong>
                <p>{{ user.email }}</p>
              </div>
              <span class="dot" :class="{ inactive: user.status === 'Inactivo' }"></span>
            </div>
            <div class="card-tags">
              <span>{{ user.role }}</span>
              <span>{{ user.code }}</span>
            </div>
            <div class="card-meta">
              <small>{{ user.salesToday }}</small>
              <small>{{ user.lastAccess }}</small>
            </div>
          </button>
        </div>
      </aside>

      <section class="studio-detail">
        <div v-if="selectedUser" class="detail-stack">
          <article class="hero" :style="{ '--hero': selectedUser.accent }">
            <div class="hero-head">
              <div>
                <p class="eyebrow">Ficha seleccionada</p>
                <h2>{{ selectedUser.fullName }}</h2>
                <p>{{ selectedUser.role }} | {{ selectedUser.email }}</p>
              </div>
              <div class="hero-actions">
                <button class="btn secondary" @click="resetEditForm">Restablecer</button>
                <button
                  class="btn"
                  :class="selectedUser.status === 'Inactivo' ? 'primary' : 'danger'"
                  :disabled="isChangingStatus"
                  @click="disableSelectedUser"
                >
                  {{
                    isChangingStatus
                      ? selectedUser.status === 'Inactivo'
                        ? 'Habilitando...'
                        : 'Deshabilitando...'
                      : selectedUser.status === 'Inactivo'
                        ? 'Habilitar'
                        : 'Deshabilitar'
                  }}
                </button>
              </div>
            </div>
            <div class="hero-metrics">
              <article><span>Rol backend</span><strong>{{ selectedUser.roleSlug }}</strong></article>
              <article><span>Estado</span><strong>{{ selectedUser.status }}</strong></article>
              <article><span>Clave</span><strong>{{ selectedUser.code }}</strong></article>
              <article><span>Actividad</span><strong>{{ selectedUser.salesToday }}</strong></article>
            </div>
          </article>

          <div class="detail-grid">
            <article class="panel">
              <h3>Resumen operativo</h3>
              <dl>
                <div><dt>Nombre</dt><dd>{{ selectedUser.fullName }}</dd></div>
                <div><dt>Correo</dt><dd>{{ selectedUser.email }}</dd></div>
                <div><dt>Clave</dt><dd>{{ selectedUser.code }}</dd></div>
                <div><dt>Ultimo acceso</dt><dd>{{ selectedUser.lastAccess }}</dd></div>
              </dl>
            </article>

            <article class="panel">
              <h3>Editar usuario</h3>
              <form class="form-grid compact-form" @submit.prevent="submitEdit">
                <label><span>Nombre</span><input v-model="editForm.name" type="text" required /></label>
                <label><span>Apellido</span><input v-model="editForm.last_name" type="text" required /></label>
                <label><span>Email</span><input v-model="editForm.email" type="email" required /></label>
                <label><span>Rol</span><select v-model.number="editForm.role_id"><option :value="1">Administrador</option><option :value="2">Empleado</option></select></label>
                <label class="full"><span>Nueva contraseña</span><input v-model="editForm.password" type="password" minlength="8" placeholder="Opcional, minimo 8 caracteres" /></label>
                <div class="modal-actions full">
                  <button type="button" class="btn ghost" @click="resetEditForm">Cancelar cambios</button>
                  <button type="submit" class="btn secondary" :disabled="isSavingEdit">{{ isSavingEdit ? 'Guardando...' : 'Guardar cambios' }}</button>
                </div>
              </form>
            </article>

            <article class="panel panel-wide">
              <h3>Permisos esperados</h3>
              <div class="permission-grid">
                <section v-for="group in selectedUser.permissions" :key="group.title" class="permission-group">
                  <h4>{{ group.title }}</h4>
                  <div v-for="permission in group.items" :key="permission.name" class="permission-item">
                    <span>{{ permission.name }}</span>
                    <b :class="{ denied: !permission.allowed }">{{ permission.allowed ? 'Permitido' : 'Restringido' }}</b>
                  </div>
                </section>
              </div>
            </article>
          </div>
        </div>

        <div v-else class="empty-state">
          <p class="eyebrow">Sin seleccion</p>
          <h2>Elige una tarjeta</h2>
          <p>La ficha del usuario aparecera aqui, del lado derecho.</p>
        </div>
      </section>
    </section>

    <div v-if="isCreateModalOpen" class="modal-overlay" @click.self="closeCreateModal">
      <div class="modal-card">
        <div class="modal-head">
          <div>
            <p class="eyebrow">Alta de staff</p>
            <h3>Nuevo usuario</h3>
          </div>
          <button class="close-btn" @click="closeCreateModal">x</button>
        </div>
        <form class="form-grid" @submit.prevent="submitCreate">
          <label><span>Nombre</span><input v-model="createForm.name" type="text" required /></label>
          <label><span>Apellido</span><input v-model="createForm.last_name" type="text" required /></label>
          <label><span>Email</span><input v-model="createForm.email" type="email" required /></label>
          <label><span>Clave de usuario</span><input v-model="createForm.user_id" type="text" required /></label>
          <label><span>Contraseña</span><input v-model="createForm.password" type="password" minlength="8" required /></label>
          <label><span>Rol</span><select v-model.number="createForm.role_id"><option :value="1">Administrador</option><option :value="2">Empleado</option></select></label>
          <div class="modal-actions full">
            <button type="button" class="btn ghost" @click="closeCreateModal">Cancelar</button>
            <button type="submit" class="btn secondary" :disabled="isSavingCreate">{{ isSavingCreate ? 'Guardando...' : 'Crear usuario' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.users-page { height: calc(100vh - 80px); padding: 24px; overflow: hidden; background: linear-gradient(135deg, #f5efe4, #eef7ff 50%, #edf8f2); }
.staff-studio { max-width: 1480px; height: 100%; margin: 0 auto; display: grid; grid-template-columns: minmax(320px, .9fr) minmax(420px, 1.1fr); gap: 24px; }
.studio-sidebar, .hero, .panel, .empty-state, .modal-card { border-radius: 28px; background: rgba(255,255,255,.86); box-shadow: 0 20px 45px rgba(15,23,42,.08); }
.studio-sidebar, .studio-detail { min-height: 0; }
.studio-sidebar { padding: 24px; display: flex; flex-direction: column; overflow: hidden; }
.studio-detail { overflow: hidden; }
.sidebar-head, .hero-head, .modal-head, .modal-actions { display: flex; justify-content: space-between; gap: 14px; }
.eyebrow { margin: 0 0 6px; font-size: .78rem; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; color: #b45309; }
h1, h2, h3, h4, p { margin-top: 0; }
h1, h2, h3, h4, strong, b, dt, dd { color: #172033; }
.lead, .hero p, .modal-head p, .empty-state p, .staff-card p, .staff-card small, li { color: #55657d; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 18px 0; }
.stats-grid article { padding: 14px; border-radius: 20px; background: linear-gradient(135deg, #fff7ed, #f8fafc); }
.stats-grid span { display: block; font-size: .78rem; text-transform: uppercase; color: #7c4a12; }
.stats-grid strong { display: block; margin-top: 6px; font-size: 1.8rem; }
.feedback { padding: 12px 14px; border-radius: 18px; margin: 0 0 12px; }
.feedback.ok { background: #dcfce7; color: #166534; }
.feedback.error { background: #fee2e2; color: #991b1b; }
.search-input, .form-grid input, .form-grid select { width: 100%; box-sizing: border-box; border: 1px solid rgba(148,163,184,.4); border-radius: 16px; padding: 13px 15px; font-size: .95rem; outline: none; }
.search-input { margin: 8px 0 14px; }
.filter-row, .card-tags, .card-meta, .hero-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.pill, .btn, .card-tags span, .permission-item b, .close-btn { border: none; border-radius: 999px; cursor: pointer; font-weight: 800; }
.pill { padding: 9px 14px; background: #fff; color: #30435e; }
.pill.active { background: #172033; color: #fff; }
.btn { padding: 11px 16px; }
.btn.primary { background: linear-gradient(135deg, #0f766e, #155e75); color: #fff; }
.btn.secondary { background: #1d4ed8; color: #fff; }
.btn.danger { background: #dc2626; color: #fff; }
.btn.ghost { background: #e2e8f0; color: #334155; }
.btn:disabled { opacity: .55; cursor: not-allowed; }
.staff-list { display: flex; flex-direction: column; gap: 14px; flex: 1; min-height: 0; overflow: auto; padding-right: 4px; }
.staff-card { width: 100%; text-align: left; padding: 18px; border: 1px solid rgba(255,255,255,.85); border-left: 6px solid var(--accent); border-radius: 24px; background: rgba(255,255,255,.96); box-shadow: 0 16px 30px rgba(15,23,42,.08); cursor: pointer; }
.staff-card.selected { box-shadow: 0 20px 38px rgba(15,23,42,.12); }
.card-top { display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; }
.avatar { width: 46px; height: 46px; display: inline-flex; align-items: center; justify-content: center; border-radius: 16px; background: #172033; color: #fff; font-weight: 900; }
.dot { width: 12px; height: 12px; border-radius: 999px; background: #22c55e; box-shadow: 0 0 0 6px rgba(34,197,94,.12); }
.dot.inactive { background: #ef4444; box-shadow: 0 0 0 6px rgba(239,68,68,.12); }
.card-tags span { padding: 6px 10px; background: #f8fafc; color: #475569; }
.card-meta { justify-content: space-between; margin-top: 12px; }
.panel-message { margin: 0; padding: 24px; border-radius: 22px; background: rgba(255,255,255,.7); text-align: center; }
.detail-stack { display: flex; flex-direction: column; gap: 18px; height: 100%; min-height: 0; overflow: auto; padding-right: 4px; }
.hero { padding: 28px; background: linear-gradient(145deg, var(--hero), #172033 72%); color: #fff; }
.hero h2, .hero strong, .hero .eyebrow { color: #fff; }
.hero p { color: rgba(255,255,255,.82); }
.hero-metrics, .detail-grid, .permission-grid, .form-grid { display: grid; gap: 16px; }
.hero-metrics { grid-template-columns: repeat(4, 1fr); margin-top: 18px; }
.hero-metrics article { padding: 14px; border-radius: 20px; background: rgba(255,255,255,.12); }
.hero-metrics span { display: block; font-size: .75rem; text-transform: uppercase; letter-spacing: .08em; color: rgba(255,255,255,.7); }
.detail-grid { grid-template-columns: repeat(2, 1fr); }
.panel { padding: 22px; }
.panel-wide { grid-column: 1 / -1; }
dl { display: grid; gap: 14px; margin: 0; }
dl div { padding-bottom: 10px; border-bottom: 1px solid rgba(148,163,184,.24); }
dt { margin-bottom: 4px; color: #64748b; font-size: .84rem; }
dd { margin: 0; font-weight: 700; }
.permission-grid { grid-template-columns: repeat(3, 1fr); }
.permission-group { padding: 16px; border-radius: 20px; background: #f8fafc; }
.permission-item { display: flex; justify-content: space-between; gap: 10px; margin-top: 10px; }
.permission-item b { padding: 5px 9px; background: #dcfce7; color: #166534; font-size: .74rem; }
.permission-item b.denied { background: #fee2e2; color: #991b1b; }
.empty-state { min-height: 420px; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 28px; text-align: center; }
.modal-overlay { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(15,23,42,.42); backdrop-filter: blur(8px); z-index: 60; }
.modal-card { width: min(720px, 100%); padding: 24px; }
.close-btn { width: 38px; height: 38px; background: #e2e8f0; color: #172033; }
.form-grid { grid-template-columns: repeat(2, 1fr); }
.form-grid label { display: flex; flex-direction: column; gap: 8px; color: #334155; font-weight: 700; }
.form-grid .full { grid-column: 1 / -1; }
.compact-form { margin-top: 12px; }
@media (max-width: 1180px) { .staff-studio, .detail-grid, .permission-grid, .hero-metrics { grid-template-columns: 1fr; } .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 1180px) { .users-page { height: auto; overflow: visible; } .staff-studio { height: auto; } .studio-sidebar, .studio-detail, .staff-list, .detail-stack { overflow: visible; } }
@media (max-width: 760px) { .users-page { padding: 16px; } .sidebar-head, .hero-head, .modal-head, .modal-actions { flex-direction: column; } .stats-grid, .form-grid { grid-template-columns: 1fr; } .hero-actions .btn, .btn.primary { width: 100%; } }
</style>
