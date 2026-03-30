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
export interface Product{
  id:number,
  name:string,
  codigo:string,
  sale_price:number,
  location:string,
  stock:number
  image_url:string

}
export interface PaymentMethod {
  id:number
  method_name:string
  slug:string
}
export interface Sale{
  id:number
  payment_method_id : number
  customer_id:number
  amount_received: number
  products: Product[]
}
