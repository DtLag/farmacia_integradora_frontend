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
        return sumar + Number(detail.subtotal);
    }, 0);
})
</script>

<template>
    <div v-if="props.order && props.modal == 'procesar'" class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" @click.self="close">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            <div class="p-5 sm:p-6 border-b border-gray-100 shrink-0">
                <h2 class="text-xl font-bold text-gray-800">Procesar pedido</h2>
                <p class="text-sm text-gray-500 mt-1">Se comenzará a preparar el pedido <span class="font-bold text-amber-600">#{{ props.order?.id }}</span></p>
            </div>
    
            <div class="p-5 sm:p-6 overflow-y-auto flex-grow bg-gray-50/50 space-y-4 text-sm sm:text-base text-gray-700">
                <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2 text-xs sm:text-sm">
                    <p class="flex justify-between"><span class="text-gray-500">Cliente:</span> <span class="font-bold">{{ props.order.customer?.name }}</span></p>
                    <p class="flex justify-between"><span class="text-gray-500">Empleado:</span> <span class="font-medium">{{ props.order.employee?.name }}</span></p>
                    <p class="flex justify-between"><span class="text-gray-500">Fecha límite:</span> <span class="font-bold text-rose-600">{{ props.order.scheduled_time }}</span></p>
                    <p class="flex justify-between"><span class="text-gray-500">Método de pago:</span> <span class="font-bold">{{ props.order.payment?.method_name || 'Cancelado' }}</span></p>
                </div>
    
                <div>
                    <h3 class="font-bold text-gray-800 mb-2 uppercase tracking-wider text-[10px] sm:text-xs">Productos a surtir:</h3>
                    <ul class="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
                        <li v-for="detail in props.order.order_details" :key="detail.id" class="p-3 text-xs sm:text-sm flex justify-between items-center">
                            <div class="min-w-0 pr-2">
                                <p class="font-bold text-gray-800 truncate">{{ detail.product.name }}</p>
                                <p class="text-[10px] sm:text-xs text-gray-500 truncate">{{ detail.product.presentation }}</p>
                            </div>
                            <span class="bg-amber-100 text-amber-800 font-bold px-2 py-1 rounded shrink-0">x{{ detail.amount }}</span>
                        </li>
                    </ul>
                </div>
            </div>
    
            <div class="p-4 sm:p-5 border-t border-gray-100 bg-white shrink-0 flex gap-3 justify-end">
                <button @click="close" class="px-4 sm:px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors w-full sm:w-auto">Cancelar</button>
                <button @click="processOrder" class="px-4 sm:px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-colors w-full sm:w-auto flex items-center justify-center gap-2">
                    <i class="fas fa-box"></i> Confirmar
                </button>
            </div>  
        </div>
    </div>

    <div v-if="props.order && props.modal == 'cancelar'" class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" @click.self="close">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
            <div class="p-5 sm:p-6 border-b border-rose-100 bg-rose-50/50 shrink-0">
                <h2 class="text-xl font-bold text-rose-600 flex items-center gap-2">
                    <i class="fas fa-exclamation-triangle"></i> Cancelar pedido
                </h2>
                <p class="text-sm text-gray-600 mt-1">¿Estás seguro de cancelar el pedido <span class="font-bold">#{{ props.order?.id }}</span>?</p>
            </div>
    
            <div class="p-5 sm:p-6 overflow-y-auto flex-grow bg-white space-y-4 text-sm sm:text-base text-gray-700">
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs sm:text-sm space-y-2">
                    <p class="flex justify-between"><span class="text-gray-500">Cliente:</span> <span class="font-bold">{{ props.order.customer?.name }}</span></p>
                    <p class="flex justify-between"><span class="text-gray-500">Fecha límite:</span> <span>{{ props.order.scheduled_time }}</span></p>
                </div>
    
                <div>
                    <h3 class="font-bold text-gray-800 mb-2 uppercase tracking-wider text-[10px] sm:text-xs">Productos a cancelar:</h3>
                    <ul class="border border-gray-200 rounded-xl divide-y divide-gray-100">
                        <li v-for="detail in props.order.order_details" :key="detail.id" class="p-3 text-xs sm:text-sm flex justify-between items-center">
                            <span class="font-medium text-gray-700 truncate pr-2">{{ detail.product.name }}</span>
                            <span class="text-gray-500 font-bold shrink-0">x{{ detail.amount }}</span>
                        </li>
                    </ul>
                </div>
            </div>
    
            <div class="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-3 justify-end">
                <button @click="close" class="px-4 sm:px-5 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-sm transition-colors w-full sm:w-auto">Volver</button>
                <button @click="cancelOrder" class="px-4 sm:px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-colors w-full sm:w-auto">
                    Sí, cancelar
                </button>
            </div>
        </div>
    </div>

    <div v-if="props.order && props.modal == 'completar'" class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" @click.self="close">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
            <div class="p-5 sm:p-6 border-b border-emerald-100 bg-emerald-50/50 shrink-0">
                <h2 class="text-xl font-bold text-emerald-600 flex items-center gap-2">
                    <i class="fas fa-check-circle"></i> Entregar pedido
                </h2>
                <p class="text-sm text-gray-600 mt-1">Confirmar la entrega al cliente del pedido <span class="font-bold">#{{ props.order?.id }}</span></p>
            </div>
    
            <div class="p-5 sm:p-6 overflow-y-auto flex-grow bg-white space-y-4 text-sm sm:text-base text-gray-700">
                <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs sm:text-sm space-y-2">
                    <p class="flex justify-between border-b border-gray-200 pb-1"><span class="text-gray-500">Cliente:</span> <span class="font-bold text-gray-800">{{ props.order.customer?.name }}</span></p>
                    <p class="flex justify-between pt-1"><span class="text-gray-500">Pago:</span> <span class="font-bold text-blue-600">{{ props.order.payment?.method_name || 'N/A' }}</span></p>
                </div>

                <div>
                    <h3 class="font-bold text-gray-800 mb-2 uppercase tracking-wider text-[10px] sm:text-xs">Resumen:</h3>
                    <ul class="border border-gray-200 rounded-xl divide-y divide-gray-100 mb-4">
                        <li v-for="detail in props.order.order_details" :key="detail.id" class="p-3 text-xs sm:text-sm flex justify-between items-center">
                            <div class="min-w-0 pr-2">
                                <p class="font-medium text-gray-800 truncate">{{ detail.product.name }}</p>
                                <p class="text-[10px] sm:text-xs text-gray-400">{{ detail.amount }} x ${{ detail.unit_price }}</p>
                            </div>
                            <span class="font-bold text-gray-700 shrink-0">${{ detail.subtotal }}</span>
                        </li>
                    </ul>

                    <div class="flex justify-between items-center bg-emerald-600 text-white p-4 rounded-xl shadow-md">
                        <span class="font-bold uppercase tracking-wider text-sm">Cobrar:</span>
                        <span class="font-black text-2xl">${{total?.toFixed(2)}}</span>
                    </div>
                </div>
            </div>
    
            <div class="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-3 justify-end">
                <button @click="close" class="px-4 sm:px-5 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-sm transition-colors w-full sm:w-auto">Cancelar</button>
                <button @click="completeOrder" class="px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors w-full sm:w-auto flex items-center justify-center gap-2">
                    Entregar <i class="fas fa-hand-holding-box"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-in {
  animation-name: zoomIn;
  animation-duration: 0.2s;
  animation-timing-function: ease-out;
}
@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>