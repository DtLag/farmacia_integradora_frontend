import { defineStore } from "pinia";
import { ref} from "vue";
import type { Order } from "@/types/types";
import { useApi } from '@/composables/useApiFetch.ts'

export const useOrdersStore = defineStore('orderStore', () => {
    const orders = ref<Order[]>([]);
    const selectedOrder = ref<Order | null>(null);
    const activeModal = ref< 'procesar' | 'cancelar' | 'completar' | null>(null);
    const currentState = ref< string>('pending');
    const timerId = ref<number | null>(null)

    async function getOrders(state: string = 'pending'){
        const {data, error} = await useApi(`/pickup/order/${state}`).get().json();
        
        currentState.value = state;

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

    function autoRefresh(){
        if(timerId.value){
            return;
        }

        timerId.value = setInterval(() => {
            getOrders(currentState.value);
        }, 300000);
    }

    function cancelAutoRefresh(){
        if(timerId.value){
            clearInterval(timerId.value);
            timerId.value = null;
        }
        
    }

    async function startProcessOrder (){
        await useApi(`/pickup/orders/${selectedOrder.value?.id}/start`).patch().json();

        await getOrders();
        closeModal()
    }

    async function completeOrder (){
        await useApi(`/pickup/${selectedOrder.value?.id}/complete`).post().json();

        await getOrders();
        closeModal()
    }

    async function cancelOrder (){
        await useApi(`/pickup/${selectedOrder.value?.id}/cancel`).post().json();

        await getOrders();
        closeModal()
    }

    return {orders, selectedOrder, activeModal, currentState, getOrders, selectOrder, openModal, autoRefresh, cancelAutoRefresh, closeModal, startProcessOrder, completeOrder, cancelOrder}
})