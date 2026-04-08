import { defineStore } from "pinia";
import { ref} from "vue";
import type { Order } from "@/types/types";
import {useFetch} from '@vueuse/core'

export const useOrdersStore = defineStore('orderStore', () => {
    const orders = ref<Order[]>([])
    const selectedOrder = ref<Order | null>(null);
    const activeModal = ref< 'procesar' | 'cancelar' | 'completar' | null>(null);

    async function getOrders(state: string = 'pending'){
        const {data, error} = await useFetch(`http://127.0.0.1:8000/api/pickup/order/${state}`).get().json();
        
        if(orders.value){
            orders.value = data.value.data
        }
    }

    function selectOrder(order: Order){
        selectedOrder.value = order
    }

    function openModal(state: 'procesar' | 'cancelar' | 'completar'){
        activeModal.value = state
    }

    function closeModal(){
        activeModal.value = null
    }

    async function startProcessOrder (){
        await useFetch(`http://127.0.0.1:8000/api/pickup/orders/${selectedOrder.value?.id}/start`).patch().json();

        await getOrders();
        closeModal()
    }

    async function completeOrder (){
        await useFetch(`http://127.0.0.1:8000/api/pickup/${selectedOrder.value?.id}/complete`).post().json();

        await getOrders();
        closeModal()
    }

    async function cancelOrder (){
        await useFetch(`http://127.0.0.1:8000/api/pickup/${selectedOrder.value?.id}/cancel`).post().json();

        await getOrders();
        closeModal()
    }

    return {orders, selectedOrder, activeModal, getOrders, selectOrder, openModal, closeModal, startProcessOrder, completeOrder, cancelOrder}
})