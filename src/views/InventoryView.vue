<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useApi } from '@/composables/useApiFetch'
import { useAuthStore } from '@/stores/auth'

interface InventoryItem {
  codigo: string
  name: string
  sale_price: number | string
  location: string | null
  stock: number
  image_url: string | null
  expiration_date: string | null
}

interface SelectOption {
  id: number
  name: string
}

interface ProductForm {
  codigo: string
  name: string
  presentation: string
  purchase_price: number
  sale_price: number
  location: string
  min_stock: number
  max_stock: number | null
  description: string
  supplier_id: number | null
  category_id: number | null
  image: File | null
}

const authStore = useAuthStore()
const query = ref('')
const inventoryItems = ref<InventoryItem[]>([])
const isLoading = ref(false)
const showProductModal = ref(false)
const isSavingProduct = ref(false)
const productError = ref('')
const productSuccess = ref('')
const categories = ref<SelectOption[]>([])
const suppliers = ref<SelectOption[]>([])
const productForm = ref<ProductForm>(getInitialProductForm())

const totalProducts = computed(() => inventoryItems.value.length)
const totalLots = computed(() => inventoryItems.value.length)
const lowStockLots = computed(() => inventoryItems.value.filter((item) => item.stock > 0 && item.stock <= 10).length)
const outOfStockLots = computed(() => inventoryItems.value.filter((item) => item.stock <= 0).length)
const expiringLots = computed(() => {
  const today = new Date()
  const nextMonth = new Date()
  nextMonth.setDate(today.getDate() + 30)

  return inventoryItems.value.filter((item) => {
    if (!item.expiration_date) return false

    const expiration = new Date(item.expiration_date)
    return expiration >= today && expiration <= nextMonth
  }).length
})
const inventoryValue = computed(() =>
  inventoryItems.value.reduce((total, item) => total + Number(item.sale_price || 0) * Number(item.stock || 0), 0),
)

onMounted(() => {
  loadCategories()
  loadSuppliers()
  getInventory()
})

watch(query, (newValue) => {
  getInventory(newValue)
})

async function getInventory(search = '') {
  isLoading.value = true

  try {
    const params = new URLSearchParams({ query: search })
    const { data, error } = await useApi(`/products/search?${params.toString()}`).get().json()

    if (error.value) {
      console.error(error.value)
      inventoryItems.value = []
      return
    }

    inventoryItems.value = (data.value?.data ?? []) as InventoryItem[]
  } catch (error) {
    console.error('Error cargando inventario:', error)
    inventoryItems.value = []
  } finally {
    isLoading.value = false
  }
}

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
}

function formatDate(value: string | null) {
  if (!value) return 'Pendiente'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX').format(date)
}

function getStatus(expirationDate: string | null) {
  if (!expirationDate) {
    return { label: 'Sin fecha', className: 'status-pending' }
  }

  const today = new Date()
  const expiration = new Date(expirationDate)
  const nextMonth = new Date()
  nextMonth.setDate(today.getDate() + 30)

  if (expiration < today) {
    return { label: 'Vencido', className: 'status-expired' }
  }

  if (expiration <= nextMonth) {
    return { label: 'Por vencer', className: 'status-warning' }
  }

  return { label: 'Vigente', className: 'status-active' }
}

function getInitialProductForm(): ProductForm {
  return {
    codigo: '',
    name: '',
    presentation: '',
    purchase_price: 0,
    sale_price: 0,
    location: '',
    min_stock: 0,
    max_stock: null,
    description: '',
    supplier_id: null,
    category_id: null,
    image: null,
  }
}

async function loadCategories() {
  try {
    const { data, error } = await useApi('/categories').get().json()

    if (error.value) {
      console.error(error.value)
      categories.value = []
      return
    }

    categories.value = Array.isArray(data.value) ? (data.value as SelectOption[]) : []
  } catch (error) {
    console.error('Error cargando categorias:', error)
    categories.value = []
  }
}

async function loadSuppliers() {
  try {
    const { data, error } = await useApi('/suppliers').get().json()

    if (error.value) {
      console.error(error.value)
      suppliers.value = []
      return
    }

    suppliers.value = Array.isArray(data.value) ? (data.value as SelectOption[]) : []
  } catch (error) {
    console.error('Error cargando proveedores:', error)
    suppliers.value = []
  }
}

function openProductModal() {
  productError.value = ''
  productSuccess.value = ''
  productForm.value = getInitialProductForm()
  showProductModal.value = true
}

function closeProductModal() {
  if (isSavingProduct.value) return

  showProductModal.value = false
  productError.value = ''
}

function handleProductImageChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  productForm.value.image = file
}

async function submitProduct() {
  productError.value = ''
  productSuccess.value = ''
  isSavingProduct.value = true

  try {
    const formData = new FormData()

    formData.append('codigo', productForm.value.codigo)
    formData.append('name', productForm.value.name)
    formData.append('presentation', productForm.value.presentation)
    formData.append('purchase_price', String(productForm.value.purchase_price))
    formData.append('sale_price', String(productForm.value.sale_price))
    formData.append('location', productForm.value.location)
    formData.append('min_stock', String(productForm.value.min_stock))
    formData.append('description', productForm.value.description)

    if (productForm.value.max_stock !== null) {
      formData.append('max_stock', String(productForm.value.max_stock))
    }

    if (productForm.value.supplier_id) {
      formData.append('supplier_id', String(productForm.value.supplier_id))
    }

    if (productForm.value.category_id) {
      formData.append('category_id', String(productForm.value.category_id))
    }

    if (productForm.value.image) {
      formData.append('image', productForm.value.image)
    }

    const response = await fetch('https://api.harold-dev.me/api/products', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      credentials: 'include',
      body: formData,
    })

    const responsePayload = await response.json().catch(() => null)

    if (!response.ok) {
      productError.value = responsePayload?.message || 'No se pudo guardar el producto.'
      return
    }

    productSuccess.value = responsePayload?.message || 'Producto agregado correctamente.'
    showProductModal.value = false
    productForm.value = getInitialProductForm()
    await getInventory(query.value)
  } catch (error) {
    console.error('Error guardando producto:', error)
    productError.value = 'Ocurrio un error al guardar el producto.'
  } finally {
    isSavingProduct.value = false
  }
}
</script>

<template>
  <div class="inventory-page">
    <section class="inventory-toolbar">
      <div class="inventory-search">
        <input v-model="query" type="text" placeholder="Buscar producto por nombre o codigo..." />
      </div>
      <button class="inventory-add-button" @click="openProductModal">+ Agregar Producto</button>
    </section>

    <p v-if="productSuccess" class="feedback-message success-message">{{ productSuccess }}</p>
    <p v-if="productError" class="feedback-message error-message">{{ productError }}</p>

    <section class="inventory-filters">
      <div class="filter-group">
        <label for="categoria">Categoría:</label>
        <select id="categoria">
          <option value="">Todas</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="stock">Stock:</label>
        <select id="stock">
          <option value="">Todos</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="vencimientos">Vencimientos:</label>
        <select id="vencimientos">
          <option value="">Todos</option>
        </select>
      </div>
    </section>
    
    <section class="inventory-stats">
      <article class="stat-card stat-card-blue">
        <h2>{{ totalProducts }}</h2>
        <p>Total Productos</p>
      </article>

      <article class="stat-card stat-card-indigo">
        <h2>{{ totalLots }}</h2>
        <p>Total Lotes</p>
      </article>

      <article class="stat-card stat-card-orange">
        <h2>{{ lowStockLots }}</h2>
        <p>Lotes Stock Bajo</p>
      </article>

      <article class="stat-card stat-card-red">
        <h2>{{ outOfStockLots }}</h2>
        <p>Lotes Sin Stock</p>
      </article>

      <article class="stat-card stat-card-pink">
        <h2>{{ expiringLots }}</h2>
        <p>Lotes Por Vencer</p>
      </article>

      <article class="stat-card stat-card-green">
        <h2>{{ formatCurrency(inventoryValue) }}</h2>
        <p>Valor Inventario</p>
      </article>
    </section>

    <section class="inventory-table-panel">
      <div class="table-panel-header">
        <h3>Inventario por Lotes</h3>

        <div class="table-actions">
          <button>Nuevo Lote</button>
          <button>Exportar</button>
          <button>Alertas</button>
          <button>Nuevo</button>
        </div>
      </div>

      <table class="inventory-table">
        <thead>
          <tr>
            <th>CODIGO</th>
            <th>PRODUCTO</th>
            <th>LOTE</th>
            <th>CATEGORIA</th>
            <th>STOCK TOTAL</th>
            <th>PRECIO COMPRA</th>
            <th>PRECIO VENTA</th>
            <th>PROVEEDOR</th>
            <th>FECHA INGRESO</th>
            <th>FECHA VENCIMIENTO</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="12" class="table-message">Cargando inventario...</td>
          </tr>
          <tr v-else-if="inventoryItems.length === 0">
            <td colspan="12" class="table-message">No se encontraron productos.</td>
          </tr>
          <tr v-for="item in inventoryItems" :key="item.codigo">
            <td>{{ item.codigo }}</td>
            <td>{{ item.name }}</td>
            <td>Pendiente</td>
            <td>Pendiente</td>
            <td>{{ item.stock }}</td>
            <td>Pendiente</td>
            <td>{{ formatCurrency(item.sale_price) }}</td>
            <td>Pendiente</td>
            <td>Pendiente</td>
            <td>{{ formatDate(item.expiration_date) }}</td>
            <td>
              <span class="status-badge" :class="getStatus(item.expiration_date).className">
                {{ getStatus(item.expiration_date).label }}
              </span>
            </td>
            <td><button class="delete-button">Eliminar</button></td>
          </tr>
        </tbody>
      </table> 
    </section>

    <div v-if="showProductModal" class="modal-overlay" @click.self="closeProductModal">
      <div class="product-modal">
        <div class="modal-header">
          <div>
            <h3>Agregar Producto</h3>
            <p>Completa los campos principales del producto.</p>
          </div>
          <button class="modal-close" @click="closeProductModal">×</button>
        </div>

        <form class="product-form" @submit.prevent="submitProduct">
          <div class="form-grid">
            <div class="form-group">
              <label for="codigo">Codigo</label>
              <input id="codigo" v-model="productForm.codigo" type="text" />
            </div>

            <div class="form-group">
              <label for="name">Nombre</label>
              <input id="name" v-model="productForm.name" type="text" required />
            </div>

            <div class="form-group">
              <label for="presentation">Presentacion</label>
              <input id="presentation" v-model="productForm.presentation" type="text" />
            </div>

            <div class="form-group">
              <label for="location">Ubicacion</label>
              <input id="location" v-model="productForm.location" type="text" />
            </div>

            <div class="form-group">
              <label for="purchase_price">Precio compra</label>
              <input id="purchase_price" v-model.number="productForm.purchase_price" type="number" min="0" step="0.01" required />
            </div>

            <div class="form-group">
              <label for="sale_price">Precio venta</label>
              <input id="sale_price" v-model.number="productForm.sale_price" type="number" min="0" step="0.01" required />
            </div>

            <div class="form-group">
              <label for="min_stock">Stock minimo</label>
              <input id="min_stock" v-model.number="productForm.min_stock" type="number" min="0" required />
            </div>

            <div class="form-group">
              <label for="max_stock">Stock maximo</label>
              <input id="max_stock" v-model.number="productForm.max_stock" type="number" min="0" />
            </div>

            <div class="form-group">
              <label for="category_id">Categoria</label>
              <select id="category_id" v-model.number="productForm.category_id">
                <option :value="null">Selecciona una categoria</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="supplier_id">Proveedor</label>
              <select id="supplier_id" v-model.number="productForm.supplier_id">
                <option :value="null">Selecciona un proveedor</option>
                <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                  {{ supplier.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="image">Imagen</label>
              <input id="image" type="file" accept="image/*" @change="handleProductImageChange" />
            </div>
          </div>

          <div class="form-group">
            <label for="description">Descripcion</label>
            <textarea id="description" v-model="productForm.description" rows="3"></textarea>
          </div>

          <p v-if="productError" class="modal-inline-error">{{ productError }}</p>

          <div class="modal-actions">
            <button type="button" class="secondary-button" @click="closeProductModal">Cancelar</button>
            <button type="submit" class="primary-button" :disabled="isSavingProduct">
              {{ isSavingProduct ? 'Guardando...' : 'Guardar Producto' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>

.inventory-page {
  max-width: 1360px;
  margin: 0 auto;
  padding: 18px 20px 24px;
  background-color: #eef6ff;
  min-height: calc(100vh - 80px);
}

.inventory-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.inventory-search input {
  width: 300px;
  padding: 10px 14px;
  border: 1px solid #d8dee9;
  border-radius: 999px;
  font-size: 13px;
  outline: none;
}

.inventory-add-button {
  background-color: #43b36b;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 9px 12px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
}

.feedback-message {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
}

.success-message {
  background-color: #dcfce7;
  color: #166534;
}

.error-message {
  background-color: #fee2e2;
  color: #991b1b;
}

.inventory-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 18px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.filter-group select {
  min-width: 100px;
  padding: 7px 10px;
  border: 1px solid #d8dee9;
  border-radius: 7px;
  background-color: white;
  font-size: 13px;
}

.inventory-stats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background-color: white;
  border-radius: 10px;
  padding: 14px 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  border-left: 5px solid transparent;
}

.stat-card h2 {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
  color: #111827; 
}

.stat-card p {
  margin: 0;
  font-size: 13px;
  color: #6b7280; 
}

.stat-card-blue {
  border-left-color: #5b7cff;
}

.stat-card-indigo {
  border-left-color: #6f7ff2;
}

.stat-card-orange {
  border-left-color: #f6a04d;
}

.stat-card-red {
  border-left-color: #ff6262;
}

.stat-card-pink {
  border-left-color: #ff7a7a;
}

.stat-card-green {
  border-left-color: #16c47f;
}

.inventory-table-panel {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.table-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.table-panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.table-actions button {
  background-color: white;
  border: 1px solid #cfd8e3;
  border-radius: 7px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.inventory-table th {
  text-align: left;
  padding: 10px 8px;
  font-size: 12px;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.inventory-table td {
  padding: 10px 8px;
  font-size: 13px;
  color: #111827;
  border-bottom: 1px solid #eef2f7;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
}

.table-message {
  text-align: center;
  color: #6b7280;
  padding: 18px 10px;
}

.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.status-active {
  background-color: #dff7e8;
  color: #33a164;
}

.status-warning {
  background-color: #fff1d6;
  color: #d97706;
}

.status-expired {
  background-color: #ffe0e0;
  color: #dc2626;
}

.status-pending {
  background-color: #e5e7eb;
  color: #4b5563;
}

.delete-button {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 5px 9px;
  font-size: 11px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 50;
}

.product-modal {
  width: min(760px, 100%);
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.24);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.modal-header h3 {
  margin: 0 0 4px;
  font-size: 20px;
  color: #0f172a;
}

.modal-header p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.modal-close {
  border: none;
  background: transparent;
  font-size: 26px;
  line-height: 1;
  color: #64748b;
  cursor: pointer;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  color: #0f172a;
  background-color: #fff;
  outline: none;
}

.form-group textarea {
  resize: vertical;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.modal-inline-error {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  background-color: #fee2e2;
  color: #991b1b;
  font-size: 13px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.secondary-button,
.primary-button {
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.secondary-button {
  border: 1px solid #cbd5e1;
  background-color: white;
  color: #334155;
}

.primary-button {
  border: none;
  background-color: #2563eb;
  color: white;
}

.primary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>