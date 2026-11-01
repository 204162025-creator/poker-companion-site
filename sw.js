// Cache do próprio site para ele abrir sem internet depois do primeiro acesso.
// Só guarda os arquivos do site (HTML, JS, CSS, ícones); nenhuma imagem da câmera passa por aqui.
// Estratégia "rede primeiro": com internet, sempre pega a versão mais nova.
const CACHE = 'poker-companion-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return
  }
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request)
        if (response.ok) {
          const cache = await caches.open(CACHE)
          await cache.put(request, response.clone())
        }
        return response
      } catch {
        const cached = await caches.match(request)
        return cached ?? Response.error()
      }
    })(),
  )
})
