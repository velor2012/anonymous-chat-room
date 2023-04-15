import { LRUCache } from "lru-cache";

if(global != undefined && (global as any).lru == undefined ){
    (global as any).lru = new LRUCache({ max: 500, ttl:1000 * 60 * 60 * 24 })
}

export const lru = (global as any).lru