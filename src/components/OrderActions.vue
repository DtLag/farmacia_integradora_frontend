<script setup lang="ts">
import type { Order } from '@/types/types'
import { computed } from 'vue';

const props = defineProps<{order: Order | null, modal: 'procesar' | 'cancelar' | 'completar' | null}>()

const emit = defineEmits(['cerrar', 'process', 'cancel', 'complete'])

function close(){
    emit('cerrar')
}

function processOrder(){
    emit('process', props.order)
    emit('cerrar')
}

function completeOrder(){
    emit('complete', props.order)
    emit('cerrar')
}

function cancelOrder(){
    emit('cancel', props.order)
    emit('cerrar')
}

const total = computed(() => {
    return props.order?.order_details.reduce((sumar, detail) => {
        return sumar + detail.subtotal;
    }, 0);
})
</script>

<template>
    <!--Procesar pedido-->
    <div v-if="props.order && props.modal == 'procesar'" class="fixed inset-0 bg-black/40 flex items-center justify-center">
        <div class="bg-white rounded-2xl shadow-lg w-[400px] p-6">
        
            <h2 class="text-xl font-bold mb-4">Procesar pedido</h2>
    
            <p class="mb-4 text-sm text-gray-600">
                Se procesará el pedido #{{ props.order?.id }}
            </p>
    
            <div>
                <h2 class="font-bold text-lg mb-2">Detalles de la orden #{{ props.order.id }}</h2>
                <p><strong>Cliente:</strong> {{ props.order.customer?.name }}</p>
                <p><strong>Empleado encargado:</strong> {{ props.order.employee?.name }} {{ props.order.employee?.last_name }}</p>
                <p><strong>Fecha registro:</strong> {{ props.order.register_date_time }}</p>
                <p><strong>Fecha máxima:</strong> {{ props.order.scheduled_time }}</p>
                <p><strong>Método de pago:</strong> {{ props.order.payment?.method_name || 'Cancelado' }}</p>
    
                <h3 class="mt-4 font-bold text-md mb-2">Productos:</h3>
        
                <ul>
                    <li v-for="detail in props.order.order_details" :key="detail.id" class="border-b py-2">
                        <p><strong>Producto:</strong> {{ detail.product.name }} ({{ detail.product.presentation }})</p>
                        <p><strong>Cantidad:</strong> {{ detail.amount }}</p>
                        <p><strong>Precio unitario:</strong> ${{ detail.unit_price }}</p>
                        <p><strong>Subtotal:</strong> ${{ detail.subtotal }}</p>
                    </li>
                </ul>
  
            </div>
    
            <div class="flex justify-end gap-2">
                <button @click="close" class="px-4 py-2 rounded-lg bg-gray-200 cursor-pointer">Cancelar</button>
                <button @click="processOrder" class="px-4 py-2 rounded-lg bg-blue-600 text-white cursor-pointer">
                    Confirmar
                </button>
            </div>  
        </div>
    </div>

    <!--Cancelar pedido-->

    <div v-if="props.order && props.modal == 'cancelar'" class="fixed inset-0 bg-black/40 flex items-center justify-center">
        <div class="bg-white rounded-2xl shadow-lg w-[400px] p-6">
        
            <h2 class="text-xl font-bold text-red-600 mb-4">
                Cancelar pedido
            </h2>
    
            <p class="text-sm text-gray-600 mb-4">
                Se cancelará el pedido #{{ props.order?.id }}?
            </p>
    
            <h2 class="font-bold text-lg mb-2">Detalles de la orden #{{ props.order.id }}</h2>
            <p><strong>Cliente:</strong> {{ props.order.customer?.name }}</p>
            <p><strong>Empleado encargado:</strong> {{ props.order.employee?.name }} {{ props.order.employee?.last_name }}</p>
            <p><strong>Fecha registro:</strong> {{ props.order.register_date_time }}</p>
            <p><strong>Fecha máxima:</strong> {{ props.order.scheduled_time }}</p>
            <p><strong>Método de pago:</strong> {{ props.order.payment?.method_name || 'Cancelado' }}</p>
    
            <h3 class="mt-4 font-bold text-md mb-2">Productos:</h3>
        
            <ul>
                <li v-for="detail in props.order.order_details" :key="detail.id" class="border-b py-2">
                    <p><strong>Producto:</strong> {{ detail.product.name }} ({{ detail.product.presentation }})</p>
                    <p><strong>Cantidad:</strong> {{ detail.amount }}</p>
                </li>
            </ul>
    
            <div class="flex justify-end gap-2">
                <button @click="close" class="px-4 py-2 rounded-lg bg-gray-200 cursor-pointer">
                    Volver
                </button>
                <button @click="cancelOrder" class="px-4 py-2 rounded-lg bg-red-600 text-white cursor-pointer">
                    Confirmar cancelación
                </button>
            </div>
  
        </div>
    </div>

    <!--Completar pedido-->

    <div v-if="props.order && props.modal == 'completar'" class="fixed inset-0 bg-black/40 flex items-center justify-center">
        <div class="bg-white rounded-2xl shadow-lg w-[400px] p-6">
        
            <h2 class="text-xl font-bold text-green-600 mb-4">
                Entregar pedido
            </h2>
    
            <p class="text-sm text-gray-600 mb-4">
                Confirmar entrega del pedido #{{ props.order?.id }}
            </p>
    
            <div class="bg-gray-100 rounded-lg p-3 mb-4 text-sm">
                <p><strong>Cliente:</strong> {{ props.order.customer?.name }}</p>
                <p><strong>Empleado encargado:</strong> {{ props.order.employee?.name}} {{ props.order.employee?.last_name}}</p>
                <p><strong>Método de pago:</strong> {{ props.order.payment?.method_name || 'Cancelado' }}</p>

                <h3 class="mt-4 font-bold text-md mb-2">Productos del pedido:</h3>

                <ul>
                    <li v-for="detail in props.order.order_details" :key="detail.id" class="border-b py-2">
                        <p><strong>Producto:</strong> {{ detail.product.name }} ({{ detail.product.presentation }})</p>
                        <p><strong>Cantidad:</strong> {{ detail.amount }}</p>
                        <p><strong>Precio unitario:</strong> ${{ detail.unit_price }}</p>
                        <p><strong>Subtotal:</strong> ${{ detail.subtotal }}</p>
                    </li>
                </ul>

                <p><strong>Total:</strong> ${{total}}</p>

            </div>
    
            <div class="flex justify-end gap-2">
                <button @click="close" class="px-4 py-2 rounded-lg bg-gray-200 cursor-pointer">
                    Cancelar
                </button>
                <button @click="completeOrder" class="px-4 py-2 rounded-lg bg-green-600 text-white cursor-pointer">
                    Completar pedido
                </button>
            </div>
  
        </div>
    </div>
</template>

<style scoped></style>