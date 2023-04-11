import { LRUCache } from 'lru-cache'
export const lru = new LRUCache({ max: 500, ttl:1000 * 60 * 60 * 24 })
export const  theme={
    color1: "#9DC8C8",
    color2: "#58C9B9",
    color3: "#519D9E",
    color4: "#D1B6E1",
}
