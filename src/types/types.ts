export interface User {
  id: number
  name: string
  email: string
  role: string
}
export interface Credentials {
  email: string
  password: string
}
export interface Product {
  id: number
  name: string
  codigo: string
  sale_price: number
  location: string
  stock: number
  image_url: string
}
export interface PaymentMethod {
  id: number
  method_name: string
  slug: string
}
export interface Sale {
  payment_method_id: number
  customer_id: number | null
  amount_received: number | null
  products: {
    id: number
    amount: number
  }[]
}
export interface SaleItem {
  id: number
  name: string
  sale_price: number
  amount: number
}
export interface saleValues {
  total: number
  amountReceived:number
  change:number
}
