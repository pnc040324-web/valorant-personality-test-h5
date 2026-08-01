export type PaymentChannel = "wechat" | "alipay" | "stripe";
export interface PaymentOrder { id:string; channel:PaymentChannel; amount:number; subject:string; payUrl?:string; }
/** 支付网关统一入口；接入真实渠道时只需替换此服务的服务端实现。 */
export class PaymentService { static async createUnlockOrder(channel:PaymentChannel):Promise<PaymentOrder> { const response=await fetch("/api/payment",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({channel,product:"single_unlock"})}); if(!response.ok) throw new Error("创建支付订单失败"); return response.json() as Promise<PaymentOrder>; } }
