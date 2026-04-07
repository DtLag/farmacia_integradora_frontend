import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '@/types/types.ts'

export interface CartItem {
  product: Product;
  quantity: number;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(JSON.parse(localStorage.getItem('cart') || '[]'))

  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => total + (item.product.sale_price * item.quantity), 0)
  })

  function addToCart(product: Product, quantity: number = 1) {
    const existingItem = items.value.find(item => item.product.id === product.id)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({ product, quantity })
    }
    saveCart()
  }

  function removeFromCart(productId: number) {
    items.value = items.value.filter(item => item.product.id !== productId)
    saveCart()
  }

  function clearCart() {
    items.value = []
    saveCart()
  }

  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  return { items, totalItems, totalPrice, addToCart, removeFromCart, clearCart }
})