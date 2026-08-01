/** Redis 适配接口：生产环境可注入 ioredis / Upstash 实现，业务逻辑无需改动。 */
export interface CacheAdapter { get<T>(key:string):Promise<T|null>; set<T>(key:string,value:T,ttlSeconds:number):Promise<void>; del(key:string):Promise<void>; }
export const cache: CacheAdapter = { async get(){return null;}, async set(){}, async del(){} };
