<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { utils, writeFileXLSX } from 'xlsx'
import { useApi } from '@/composables/useApiFetch'
import { usePublicApi } from '@/composables/usePublicApi'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/'

interface InventoryProduct { id:number; codigo:string; name:string; presentation:string|null; purchase_price:number|string; sale_price:number|string; location:string|null; stock:number; min_stock:number; max_stock:number|null; description:string|null; expiration_date:string|null; category_name:string|null; supplier_name:string|null }
interface InventoryBatchItem { id:number; amount:number; unit_price:number|string; reception_date:string|null; expiration_date:string|null; registered_by:string|null; product:{ id:number|null; codigo:string|null; name:string|null; location:string|null; stock:number|null; category_name:string|null; supplier_name:string|null }; batch:{ id:number|null; identifier_batch:string|null; entry_date:string|null; supplier_name:string|null } }
interface SelectOption { id:number; name:string }
interface ProductForm { codigo:string; name:string; presentation:string; purchase_price:number; sale_price:number; location:string; min_stock:number; max_stock:number|null; description:string; supplier_id:number|null; category_id:number|null; image:File|null }
interface BatchFormItem { product_id:number|null; amount:number; unit_price:number; expiration_date:string }
interface BatchForm { identifier_batch:string; supplier_id:number|null; entry_date:string; notes:string; products:BatchFormItem[] }
interface SupplierForm { name:string; contact:string; email:string; phone_number:string }

const router = useRouter()
const authStore = useAuthStore()
const activeTab = ref<'batches' | 'products'>('batches')
const query = ref('')
const productsInventory = ref<InventoryProduct[]>([])
const batchInventory = ref<InventoryBatchItem[]>([])
const productOptions = ref<InventoryProduct[]>([])
const categories = ref<SelectOption[]>([])
const suppliers = ref<SelectOption[]>([])
const isLoading = ref(false)
const isSavingProduct = ref(false)
const isSavingBatch = ref(false)
const isSavingSupplier = ref(false)
const isExporting = ref(false)
const editingProductId = ref<number | null>(null)
const feedbackError = ref('')
const feedbackSuccess = ref('')
const productError = ref('')
const batchError = ref('')
const supplierError = ref('')
const showProductModal = ref(false)
const showBatchModal = ref(false)
const showSupplierModal = ref(false)
const productForm = ref<ProductForm>(initialProduct())
const batchForm = ref<BatchForm>(initialBatch())
const supplierForm = ref<SupplierForm>(initialSupplier())
const isEditingProduct = computed(() => editingProductId.value !== null)

const totalProducts = computed(() => productsInventory.value.length)
const totalLots = computed(() => batchInventory.value.length)
const lowStockProducts = computed(() => productsInventory.value.filter((p) => p.stock > 0 && p.stock <= (p.min_stock || 10)).length)
const outOfStockProducts = computed(() => productsInventory.value.filter((p) => p.stock <= 0).length)
const expiringLots = computed(() => batchInventory.value.filter((b) => expirationStatus(b.expiration_date).label === 'Por vencer').length)
const inventoryValue = computed(() => productsInventory.value.reduce((sum, p) => sum + Number(p.sale_price || 0) * Number(p.stock || 0), 0))

onMounted(async () => { await Promise.all([loadInventory(), loadCategories(), loadSuppliers(), loadProductOptions()]) })

watch(query, (value, _, onCleanup) => {
  const timeoutId = window.setTimeout(() => loadInventory(value.trim()), 300)
  onCleanup(() => window.clearTimeout(timeoutId))
})

async function loadInventory(search = '') {
  isLoading.value = true
  feedbackError.value = ''
  try { await Promise.all([loadProducts(search), loadBatches(search)]) } catch { feedbackError.value = 'No se pudo cargar el inventario.' } finally { isLoading.value = false }
}

async function loadProducts(search = '') {
  const params = new URLSearchParams()
  if (search) params.set('query', search)
  const endpoint = params.size ? `/inventory/products?${params}` : '/inventory/products'
  const { data, error } = await useApi(endpoint).get().json()
  if (error.value) throw error.value
  productsInventory.value = (data.value?.data ?? []) as InventoryProduct[]
}

async function loadBatches(search = '') {
  const params = new URLSearchParams()
  if (search) params.set('query', search)
  const endpoint = params.size ? `/inventory/batches?${params}` : '/inventory/batches'
  const { data, error } = await useApi(endpoint).get().json()
  if (error.value) throw error.value
  batchInventory.value = (data.value?.data ?? []) as InventoryBatchItem[]
}

async function loadProductOptions() {
  const { data, error } = await useApi('/inventory/products').get().json()
  if (!error.value) productOptions.value = (data.value?.data ?? []) as InventoryProduct[]
}

async function loadCategories() {
  const { data, error } = await useApi('/categories').get().json()
  if (!error.value && Array.isArray(data.value)) categories.value = data.value as SelectOption[]
}

async function loadSuppliers() {
  const { data, error } = await usePublicApi('/supply').get().json()
  if (!error.value && Array.isArray(data.value)) suppliers.value = data.value as SelectOption[]
}

function initialProduct(): ProductForm { return { codigo:'', name:'', presentation:'', purchase_price:0, sale_price:0, location:'', min_stock:0, max_stock:null, description:'', supplier_id:null, category_id:null, image:null } }
function initialBatch(): BatchForm { return { identifier_batch:'', supplier_id:null, entry_date:'', notes:'', products:[{ product_id:null, amount:1, unit_price:0, expiration_date:'' }] } }
function initialSupplier(): SupplierForm { return { name:'', contact:'', email:'', phone_number:'' } }
function currency(v:number|string) { return new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN' }).format(Number(v || 0)) }
function dateText(v:string|null|undefined) { if (!v) return 'Pendiente'; const d = new Date(v); return Number.isNaN(d.getTime()) ? String(v) : new Intl.DateTimeFormat('es-MX').format(d) }
function expirationStatus(v:string|null) { if (!v) return { label:'Sin fecha', cls:'neutral' }; const today = new Date(); const d = new Date(v); const next = new Date(); next.setDate(today.getDate() + 30); if (d < today) return { label:'Vencido', cls:'danger' }; if (d <= next) return { label:'Por vencer', cls:'warning' }; return { label:'Vigente', cls:'success' } }
function productStatus(p:InventoryProduct) { if (p.stock <= 0) return { label:'Sin stock', cls:'danger' }; if (p.stock <= p.min_stock) return { label:'Stock bajo', cls:'warning' }; return { label:'Disponible', cls:'success' } }
function addBatchRow() { batchForm.value.products.push({ product_id:null, amount:1, unit_price:0, expiration_date:'' }) }
function removeBatchRow(index:number) { if (batchForm.value.products.length > 1) batchForm.value.products.splice(index, 1) }
function handleProductImageChange(event:Event) { const input = event.target as HTMLInputElement; productForm.value.image = input.files?.[0] ?? null }
function openAlerts() { router.push({ name:'alerts' }) }
function openSupplierModal() { supplierError.value = ''; supplierForm.value = initialSupplier(); showSupplierModal.value = true }
function openCreateProductModal() { editingProductId.value = null; productError.value = ''; productForm.value = initialProduct(); showProductModal.value = true }
function closeProductModal() { showProductModal.value = false; editingProductId.value = null; productError.value = '' }
function openEditProductModal(productId:number|null) {
  if (!productId) { feedbackError.value = 'No se pudo identificar el producto para editar.'; return }
  const product = productsInventory.value.find((item) => item.id === productId)
  if (!product) { feedbackError.value = 'No se encontro la informacion del producto.'; return }
  editingProductId.value = product.id
  productError.value = ''
  productForm.value = {
    codigo: product.codigo || '',
    name: product.name || '',
    presentation: product.presentation || '',
    purchase_price: Number(product.purchase_price || 0),
    sale_price: Number(product.sale_price || 0),
    location: product.location || '',
    min_stock: Number(product.min_stock || 0),
    max_stock: product.max_stock ?? null,
    description: product.description || '',
    supplier_id: suppliers.value.find((supplier) => supplier.name === product.supplier_name)?.id ?? null,
    category_id: categories.value.find((category) => category.name === product.category_name)?.id ?? null,
    image: null,
  }
  showProductModal.value = true
}

async function disableProduct(productId:number|null) {
  if (!productId) { feedbackError.value = 'No se pudo identificar el producto a deshabilitar.'; return }
  const confirmed = window.confirm('Se deshabilitara este producto. Deseas continuar?')
  if (!confirmed) return
  feedbackError.value = ''
  try {
    const response = await fetch(`${API_BASE_URL}delete/${productId}`, { method:'DELETE', headers:{ Accept:'application/json' } })
    const body = await response.json().catch(() => null)
    if (!response.ok) { feedbackError.value = body?.message || 'No se pudo deshabilitar el producto.'; return }
    feedbackSuccess.value = body?.message || 'Producto deshabilitado correctamente.'
    await Promise.all([loadInventory(query.value.trim()), loadProductOptions()])
  } catch {
    feedbackError.value = 'Ocurrio un error al deshabilitar el producto.'
  }
}

async function submitProduct() {
  productError.value = ''
  isSavingProduct.value = true
  try {
    const formData = new FormData()
    for (const [key, value] of Object.entries(productForm.value)) {
      if (value !== null && value !== '') formData.append(key, value instanceof File ? value : String(value))
    }
    const response = await fetch(`${API_BASE_URL}${isEditingProduct.value ? `products/${editingProductId.value}` : 'products'}`, { method:isEditingProduct.value ? 'PATCH' : 'POST', headers:{ Accept:'application/json', Authorization:`Bearer ${authStore.token}` }, credentials:'include', body:formData })
    const body = await response.json().catch(() => null)
    if (!response.ok) { productError.value = body?.message || `No se pudo ${isEditingProduct.value ? 'actualizar' : 'guardar'} el producto.`; return }
    feedbackSuccess.value = body?.message || `Producto ${isEditingProduct.value ? 'actualizado' : 'agregado'} correctamente.`
    closeProductModal()
    productForm.value = initialProduct()
    await Promise.all([loadInventory(query.value.trim()), loadProductOptions()])
  } catch { productError.value = 'Ocurrio un error al guardar el producto.' } finally { isSavingProduct.value = false }
}

async function submitBatch() {
  batchError.value = ''
  const products = batchForm.value.products.filter((p) => p.product_id).map((p) => ({ product_id:Number(p.product_id), amount:Number(p.amount), unit_price:Number(p.unit_price), expiration_date:p.expiration_date || null }))
  if (!batchForm.value.identifier_batch.trim()) { batchError.value = 'Ingresa el identificador del lote.'; return }
  if (!batchForm.value.entry_date) { batchError.value = 'Selecciona la fecha de ingreso.'; return }
  if (!products.length) { batchError.value = 'Agrega al menos un producto valido.'; return }
  isSavingBatch.value = true
  try {
    const response = await fetch(`${API_BASE_URL}/register-batch-reception`, { method:'POST', headers:{ Accept:'application/json', 'Content-Type':'application/json', Authorization:`Bearer ${authStore.token}` }, credentials:'include', body:JSON.stringify({ identifier_batch:batchForm.value.identifier_batch.trim(), supplier_id:batchForm.value.supplier_id, entry_date:batchForm.value.entry_date, notes:batchForm.value.notes.trim() || null, products }) })
    const body = await response.json().catch(() => null)
    if (!response.ok) { batchError.value = response.status === 401 ? 'Tu sesion local no esta autorizada para registrar lotes. Inicia sesion otra vez.' : body?.message || 'No se pudo registrar el lote.'; return }
    feedbackSuccess.value = body?.message || 'Lote registrado correctamente.'
    activeTab.value = 'batches'
    showBatchModal.value = false
    batchForm.value = initialBatch()
    await Promise.all([loadInventory(query.value.trim()), loadProductOptions()])
  } catch { batchError.value = 'Ocurrio un error al registrar el lote.' } finally { isSavingBatch.value = false }
}

async function submitSupplier() {
  supplierError.value = ''
  if (!supplierForm.value.name.trim()) { supplierError.value = 'Ingresa al menos el nombre del proveedor.'; return }
  if (!authStore.token) { supplierError.value = 'Necesitas iniciar sesion de nuevo para guardar proveedores.'; return }
  isSavingSupplier.value = true
  try {
    const response = await fetch(`${API_BASE_URL}suppliers`, { method:'POST', headers:{ Accept:'application/json', 'Content-Type':'application/json', Authorization:`Bearer ${authStore.token}` }, credentials:'include', body:JSON.stringify({ name:supplierForm.value.name.trim(), contact:supplierForm.value.contact.trim() || null, email:supplierForm.value.email.trim() || null, phone_number:supplierForm.value.phone_number.trim() || null }) })
    const body = await response.json().catch(() => null)
    if (!response.ok) { supplierError.value = response.status === 401 ? 'El backend local no reconocio tu sesion. Inicia sesion otra vez.' : body?.message || 'No se pudo crear el proveedor.'; return }
    if (body?.supplier?.id && body?.supplier?.name) {
      suppliers.value.unshift({ id: body.supplier.id, name: body.supplier.name })
      batchForm.value.supplier_id = body.supplier.id
      productForm.value.supplier_id = body.supplier.id
    }
    feedbackSuccess.value = body?.message || 'Proveedor creado correctamente.'
    showSupplierModal.value = false
    supplierForm.value = initialSupplier()
    await loadSuppliers()
  } catch { supplierError.value = 'Ocurrio un error al guardar el proveedor.' } finally { isSavingSupplier.value = false }
}

function exportInventory() {
  isExporting.value = true
  try {
    const workbook = utils.book_new()
    const lotsSheet = utils.json_to_sheet(batchInventory.value.map((item) => ({
      Lote: item.batch.identifier_batch || 'Sin lote',
      Codigo: item.product.codigo || 'Sin codigo',
      Producto: item.product.name || 'Sin nombre',
      Categoria: item.product.category_name || 'Sin categoria',
      Proveedor: item.batch.supplier_name || item.product.supplier_name || 'Sin proveedor',
      Cantidad: item.amount,
      'Costo unitario': Number(item.unit_price || 0),
      'Fecha ingreso': dateText(item.batch.entry_date || item.reception_date),
      Vencimiento: dateText(item.expiration_date),
      Ubicacion: item.product.location || 'Sin ubicacion',
      'Stock global': Number(item.product.stock || 0),
      Estado: expirationStatus(item.expiration_date).label,
    })))
    const productsSheet = utils.json_to_sheet(productsInventory.value.map((item) => ({
      Codigo: item.codigo,
      Producto: item.name,
      Presentacion: item.presentation || 'Sin presentacion',
      Categoria: item.category_name || 'Sin categoria',
      Proveedor: item.supplier_name || 'Sin proveedor',
      Stock: item.stock,
      'Stock minimo': item.min_stock,
      'Stock maximo': item.max_stock ?? 'Sin maximo',
      'Precio compra': Number(item.purchase_price || 0),
      'Precio venta': Number(item.sale_price || 0),
      Ubicacion: item.location || 'Sin ubicacion',
      'Proximo vencimiento': dateText(item.expiration_date),
      Estado: productStatus(item).label,
    })))
    utils.book_append_sheet(workbook, lotsSheet, 'Inventario por lotes')
    utils.book_append_sheet(workbook, productsSheet, 'Inventario por productos')
    writeFileXLSX(workbook, `inventario_${new Date().toISOString().slice(0, 10)}.xlsx`)
  } catch { feedbackError.value = 'No se pudo exportar el inventario.' } finally { isExporting.value = false }
}
</script>

<template>
  <div class="page">
    <section class="hero">
      <div>
        <p class="eyebrow">Centro de inventario</p>
        <h1>Control de productos y lotes</h1>
        <p class="copy">Consulta existencias, registra lotes y exporta el inventario en una vista mas clara.</p>
      </div>
      <div class="hero-actions">
        <button class="btn secondary" @click="openAlerts">Ir a alertas</button>
        <button class="btn primary" @click="openCreateProductModal">+ Agregar producto</button>
      </div>
    </section>

    <input v-model="query" class="search" type="text" placeholder="Buscar por producto, codigo, lote o ubicacion..." />
    <p v-if="feedbackSuccess" class="flash ok">{{ feedbackSuccess }}</p>
    <p v-if="feedbackError" class="flash err">{{ feedbackError }}</p>

    <section class="stats">
      <article class="card"><span>Total productos</span><strong>{{ totalProducts }}</strong></article>
      <article class="card"><span>Total lotes</span><strong>{{ totalLots }}</strong></article>
      <article class="card"><span>Stock bajo</span><strong>{{ lowStockProducts }}</strong></article>
      <article class="card"><span>Sin stock</span><strong>{{ outOfStockProducts }}</strong></article>
      <article class="card"><span>Por vencer</span><strong>{{ expiringLots }}</strong></article>
      <article class="card"><span>Valor inventario</span><strong>{{ currency(inventoryValue) }}</strong></article>
    </section>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Inventario</h2>
          <div class="tabs">
            <button class="tab" :class="{ active: activeTab === 'batches' }" @click="activeTab = 'batches'">Inventario por lotes</button>
            <button class="tab" :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'">Inventario por productos</button>
          </div>
        </div>
        <div class="actions">
          <button class="btn secondary" @click="showBatchModal = true">Nuevo lote</button>
          <button class="btn secondary" :disabled="isExporting" @click="exportInventory">{{ isExporting ? 'Exportando...' : 'Exportar Excel' }}</button>
        </div>
      </div>

      <table v-if="activeTab === 'batches'" class="table">
        <thead><tr><th>Lote</th><th>Codigo</th><th>Producto</th><th>Categoria</th><th>Proveedor</th><th>Cantidad</th><th>Costo</th><th>Ingreso</th><th>Vencimiento</th><th>Ubicacion</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          <tr v-if="isLoading"><td colspan="13" class="empty">Cargando inventario...</td></tr>
          <tr v-else-if="batchInventory.length === 0"><td colspan="13" class="empty">No se encontraron lotes.</td></tr>
          <tr v-for="item in batchInventory" :key="item.id">
            <td>{{ item.batch.identifier_batch || 'Sin lote' }}</td><td>{{ item.product.codigo || 'Sin codigo' }}</td><td>{{ item.product.name || 'Sin nombre' }}</td><td>{{ item.product.category_name || 'Sin categoria' }}</td><td>{{ item.batch.supplier_name || item.product.supplier_name || 'Sin proveedor' }}</td><td>{{ item.amount }}</td><td>{{ currency(item.unit_price) }}</td><td>{{ dateText(item.batch.entry_date || item.reception_date) }}</td><td>{{ dateText(item.expiration_date) }}</td><td>{{ item.product.location || 'Sin ubicacion' }}</td><td>{{ item.product.stock ?? 0 }}</td><td><span class="pill" :class="expirationStatus(item.expiration_date).cls">{{ expirationStatus(item.expiration_date).label }}</span></td><td><div class="action-group"><button class="action-btn edit" @click="openEditProductModal(item.product.id)">Editar</button><button class="action-btn disable" @click="disableProduct(item.product.id)">Deshabilitar</button></div></td>
          </tr>
        </tbody>
      </table>

      <table v-else class="table">
        <thead><tr><th>Codigo</th><th>Producto</th><th>Presentacion</th><th>Categoria</th><th>Proveedor</th><th>Stock</th><th>Min</th><th>Max</th><th>Compra</th><th>Venta</th><th>Ubicacion</th><th>Vencimiento</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          <tr v-if="isLoading"><td colspan="14" class="empty">Cargando inventario...</td></tr>
          <tr v-else-if="productsInventory.length === 0"><td colspan="14" class="empty">No se encontraron productos.</td></tr>
          <tr v-for="item in productsInventory" :key="item.id">
            <td>{{ item.codigo }}</td><td>{{ item.name }}</td><td>{{ item.presentation || 'Sin presentacion' }}</td><td>{{ item.category_name || 'Sin categoria' }}</td><td>{{ item.supplier_name || 'Sin proveedor' }}</td><td>{{ item.stock }}</td><td>{{ item.min_stock }}</td><td>{{ item.max_stock ?? 'Sin maximo' }}</td><td>{{ currency(item.purchase_price) }}</td><td>{{ currency(item.sale_price) }}</td><td>{{ item.location || 'Sin ubicacion' }}</td><td>{{ dateText(item.expiration_date) }}</td><td><span class="pill" :class="productStatus(item).cls">{{ productStatus(item).label }}</span></td><td><div class="action-group"><button class="action-btn edit" @click="openEditProductModal(item.id)">Editar</button><button class="action-btn disable" @click="disableProduct(item.id)">Deshabilitar</button></div></td>
          </tr>
        </tbody>
      </table>
    </section>

    <div v-if="showProductModal" class="overlay" @click.self="closeProductModal()">
      <div class="modal">
        <div class="modal-head"><div><p class="eyebrow">{{ isEditingProduct ? 'Editar producto' : 'Nuevo producto' }}</p><h3>{{ isEditingProduct ? 'Actualizar producto' : 'Registrar producto' }}</h3><p class="copy">{{ isEditingProduct ? 'Modifica la informacion principal del producto.' : 'Captura los datos principales del producto.' }}</p></div><button class="close" @click="closeProductModal()">x</button></div>
        <form class="form" @submit.prevent="submitProduct">
          <div class="grid">
            <label class="field"><span>Codigo</span><input v-model="productForm.codigo" type="text" placeholder="Ej. 75010001" /></label>
            <label class="field"><span>Nombre</span><input v-model="productForm.name" type="text" placeholder="Nombre del producto" required /></label>
            <label class="field"><span>Presentacion</span><input v-model="productForm.presentation" type="text" placeholder="Caja, frasco, tableta..." /></label>
            <label class="field"><span>Ubicacion</span><input v-model="productForm.location" type="text" placeholder="Ej. Estante A2" /></label>
            <label class="field"><span>Precio compra</span><input v-model.number="productForm.purchase_price" type="number" min="0" step="0.01" required /></label>
            <label class="field"><span>Precio venta</span><input v-model.number="productForm.sale_price" type="number" min="0" step="0.01" required /></label>
            <label class="field"><span>Stock minimo</span><input v-model.number="productForm.min_stock" type="number" min="0" required /></label>
            <label class="field"><span>Stock maximo</span><input v-model.number="productForm.max_stock" type="number" min="0" /></label>
            <label class="field"><span>Categoria</span><select v-model.number="productForm.category_id"><option :value="null">Selecciona una categoria</option><option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option></select></label>
            <div class="field"><span>Proveedor</span><div class="supplier-row"><select v-model.number="productForm.supplier_id"><option :value="null">Selecciona un proveedor</option><option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">{{ supplier.name }}</option></select><button type="button" class="btn soft" @click="openSupplierModal">+ Proveedor</button></div></div>
            <label class="field full"><span>Imagen</span><input type="file" accept="image/*" @change="handleProductImageChange" /></label>
          </div>
          <label class="field full"><span>Descripcion</span><textarea v-model="productForm.description" rows="4" placeholder="Descripcion breve del producto"></textarea></label>
          <p v-if="productError" class="flash err">{{ productError }}</p>
          <div class="foot"><button type="button" class="btn secondary" @click="closeProductModal()">Cancelar</button><button type="submit" class="btn primary" :disabled="isSavingProduct">{{ isSavingProduct ? (isEditingProduct ? 'Actualizando...' : 'Guardando...') : (isEditingProduct ? 'Actualizar producto' : 'Guardar producto') }}</button></div>
        </form>
      </div>
    </div>

    <div v-if="showBatchModal" class="overlay" @click.self="showBatchModal = false">
      <div class="modal wide">
        <div class="modal-head"><div><p class="eyebrow">Nuevo lote</p><h3>Registrar lote</h3><p class="copy">Primero captura los datos del lote y luego agrega sus productos.</p></div><button class="close" @click="showBatchModal = false">x</button></div>
        <form class="form" @submit.prevent="submitBatch">
          <div class="section">
            <div class="grid">
              <label class="field"><span>Identificador</span><input v-model="batchForm.identifier_batch" type="text" placeholder="Ej. LOTE-2026-001" required /></label>
              <div class="field"><span>Proveedor</span><div class="supplier-row"><select v-model.number="batchForm.supplier_id"><option :value="null">Selecciona un proveedor</option><option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">{{ supplier.name }}</option></select><button type="button" class="btn soft" @click="openSupplierModal">+ Proveedor</button></div></div>
              <label class="field"><span>Fecha de ingreso</span><VueDatePicker v-model="batchForm.entry_date" model-type="yyyy-MM-dd" format="dd/MM/yyyy" :enable-time-picker="false" auto-apply :clearable="false" placeholder="dd/mm/aaaa" /></label>
              <label class="field full"><span>Notas</span><textarea v-model="batchForm.notes" rows="3" placeholder="Observaciones del lote"></textarea></label>
            </div>
          </div>
          <div class="section">
            <div class="section-head"><div><h4>Productos del lote</h4><p class="copy small">Agrega cantidad, costo unitario y vencimiento por cada producto.</p></div><button type="button" class="btn secondary" @click="addBatchRow">Agregar producto</button></div>
            <div class="rows">
              <div v-for="(item, index) in batchForm.products" :key="index" class="row">
                <label class="field"><span>Producto</span><select v-model.number="item.product_id" required><option :value="null">Selecciona un producto</option><option v-for="product in productOptions" :key="product.id" :value="product.id">{{ product.codigo }} - {{ product.name }}</option></select></label>
                <label class="field"><span>Cantidad</span><input v-model.number="item.amount" type="number" min="1" required /></label>
                <label class="field"><span>Costo unitario</span><input v-model.number="item.unit_price" type="number" min="0" step="0.01" required /></label>
                <label class="field"><span>Vencimiento</span><VueDatePicker v-model="item.expiration_date" model-type="yyyy-MM-dd" format="dd/MM/yyyy" :enable-time-picker="false" auto-apply :clearable="false" placeholder="dd/mm/aaaa" /></label>
                <button type="button" class="btn danger remove" @click="removeBatchRow(index)">Quitar</button>
              </div>
            </div>
          </div>
          <p v-if="batchError" class="flash err">{{ batchError }}</p>
          <div class="foot"><button type="button" class="btn secondary" @click="showBatchModal = false">Cancelar</button><button type="submit" class="btn primary" :disabled="isSavingBatch">{{ isSavingBatch ? 'Guardando...' : 'Guardar lote' }}</button></div>
        </form>
      </div>
    </div>

    <div v-if="showSupplierModal" class="overlay" @click.self="showSupplierModal = false">
      <div class="modal compact">
        <div class="modal-head"><div><p class="eyebrow">Proveedor</p><h3>Agregar proveedor</h3><p class="copy">Lo guardamos y lo dejamos seleccionado en el formulario actual.</p></div><button class="close" @click="showSupplierModal = false">x</button></div>
        <form class="form" @submit.prevent="submitSupplier">
          <label class="field"><span>Nombre</span><input v-model="supplierForm.name" type="text" placeholder="Nombre del proveedor" required /></label>
          <label class="field"><span>Contacto</span><input v-model="supplierForm.contact" type="text" placeholder="Persona de contacto" /></label>
          <label class="field"><span>Correo</span><input v-model="supplierForm.email" type="email" placeholder="correo@proveedor.com" /></label>
          <label class="field"><span>Telefono</span><input v-model="supplierForm.phone_number" type="text" placeholder="Telefono" /></label>
          <p v-if="supplierError" class="flash err">{{ supplierError }}</p>
          <div class="foot"><button type="button" class="btn secondary" @click="showSupplierModal = false">Cancelar</button><button type="submit" class="btn primary" :disabled="isSavingSupplier">{{ isSavingSupplier ? 'Guardando...' : 'Guardar proveedor' }}</button></div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page{max-width:1440px;margin:0 auto;padding:24px 22px 32px;min-height:calc(100vh - 80px);background:radial-gradient(circle at top right,rgba(37,99,235,.12),transparent 28%),linear-gradient(180deg,#edf4ff 0%,#e9f1ff 100%)}
.hero,.panel-head,.hero-actions,.actions,.tabs,.supplier-row,.foot,.section-head{display:flex;gap:12px}.hero,.panel-head,.section-head{justify-content:space-between;align-items:flex-start}.hero{margin-bottom:18px}.eyebrow{margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#2563eb}.copy{margin:8px 0 0;color:#64748b;font-size:14px;line-height:1.5}.copy.small{font-size:13px}.hero h1,.panel h2,.modal h3,.section-head h4{margin:0;color:#0f172a}.search{width:100%;padding:14px 18px;margin-bottom:14px;border-radius:18px;border:1px solid #c9d8ef;background:rgba(255,255,255,.92);font-size:16px;color:#1e293b}.search:focus,.field input:focus,.field select:focus,.field textarea:focus,.field :deep(.dp__input):focus{outline:none;border-color:#2563eb;box-shadow:0 0 0 4px rgba(37,99,235,.14)}.flash{margin:0 0 14px;padding:12px 14px;border-radius:14px;font-size:14px}.ok{background:#dcfce7;color:#166534}.err{background:#fee2e2;color:#b91c1c}.stats{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:14px;margin-bottom:18px}.card,.panel,.modal,.section{background:rgba(255,255,255,.94);border:1px solid rgba(191,219,254,.7);box-shadow:0 18px 40px rgba(15,23,42,.08)}.card{border-radius:18px;padding:18px}.card span{color:#64748b;font-size:13px}.card strong{display:block;margin-top:12px;font-size:28px;color:#0f172a}.panel{border-radius:24px;padding:22px;overflow:auto}.panel-head > div:first-child{display:flex;flex-direction:column;gap:10px}.tabs{margin-top:2px;flex-wrap:wrap;padding:6px;border-radius:18px;background:#eef4ff;border:1px solid #d7e4f8;width:fit-content}.tab{appearance:none;border:1px solid transparent;background:transparent;color:#31507b;border-radius:999px;padding:10px 16px;font-size:14px;font-weight:700;cursor:pointer}.tab.active{background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);color:#fff;border-color:transparent;box-shadow:0 10px 20px rgba(37,99,235,.18)}.table{width:100%;min-width:1180px;border-collapse:collapse}.table th{padding:12px 10px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#5b6b84;border-bottom:1px solid #dbe7f7}.table td{padding:14px 10px;font-size:14px;color:#122033;border-bottom:1px solid #ebf1fa}.empty{text-align:center;color:#64748b;padding:24px 12px}.action-group{display:flex;gap:8px;flex-wrap:wrap}.action-btn{border:none;border-radius:10px;padding:8px 10px;font-size:12px;font-weight:700;cursor:pointer}.action-btn.edit{background:#e0ecff;color:#1d4ed8}.action-btn.disable{background:#fee2e2;color:#b91c1c}.pill{display:inline-flex;min-width:96px;justify-content:center;padding:7px 10px;border-radius:999px;font-size:12px;font-weight:700}.success{background:#dcfce7;color:#166534}.warning{background:#fef3c7;color:#b45309}.danger{background:#fee2e2;color:#b91c1c}.neutral{background:#e5e7eb;color:#475569}.btn{border:none;border-radius:12px;padding:11px 16px;font-size:14px;font-weight:700;cursor:pointer}.btn:disabled{opacity:.7;cursor:not-allowed}.primary{background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);color:#fff;box-shadow:0 10px 20px rgba(37,99,235,.25)}.secondary{background:#fff;color:#1e3a8a;border:1px solid #c7d7ee}.soft{background:#eef4ff;color:#2563eb;white-space:nowrap}.overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(15,23,42,.48);backdrop-filter:blur(4px);z-index:70}.modal{width:min(860px,100%);max-height:calc(100vh - 40px);overflow-y:auto;border-radius:26px;padding:22px}.wide{width:min(1120px,100%)}.compact{width:min(560px,100%)}.modal-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:18px}.close{border:none;background:transparent;color:#475569;font-size:26px;line-height:1;cursor:pointer}.form{display:flex;flex-direction:column;gap:16px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.field{display:flex;flex-direction:column;gap:7px}.field span{font-size:13px;font-weight:700;color:#334155}.field input,.field select,.field textarea,.field :deep(.dp__input){width:100%;box-sizing:border-box;border:1px solid #c9d8ef;border-radius:14px;padding:12px 14px;background:#fbfdff;color:#0f172a;font-size:14px}.field textarea{resize:vertical}.field :deep(.dp__main){width:100%}.field :deep(.dp__input_wrap){width:100%}.field :deep(.dp__input_icon){left:12px;color:#64748b}.field :deep(.dp__clear_icon){display:none}.field :deep(.dp__input){padding-left:40px;padding-right:14px;min-height:48px}.full{grid-column:1 / -1}.section{border-radius:20px;padding:18px}.rows{display:flex;flex-direction:column;gap:12px}.row{display:grid;grid-template-columns:minmax(260px,2fr) 1fr 1fr 1fr auto;gap:12px;align-items:end;padding:14px;border-radius:18px;background:#f7faff;border:1px solid #dbe7f7}.remove{align-self:end}
@media (max-width:1180px){.stats{grid-template-columns:repeat(3,minmax(0,1fr))}.row{grid-template-columns:1fr 1fr}}
@media (max-width:820px){.page{padding:18px 14px 24px}.hero,.panel-head,.section-head,.foot,.hero-actions,.actions,.tabs,.supplier-row{flex-direction:column;align-items:stretch}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.grid,.row{grid-template-columns:1fr}}
</style>
