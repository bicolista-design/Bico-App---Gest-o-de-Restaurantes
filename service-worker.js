
const CACHE_NAME = 'bico-app-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Poppins:wght@300;400;500;600;700;900&display=swap'
];

// Instalação: Cacheia arquivos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('App: Cacheando recursos estáticos');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Busca (Fetch): Estratégia Stale-While-Revalidate
// Serve o cache imediatamente e atualiza em background
self.addEventListener('fetch', (event) => {
  // Ignora chamadas de API externas se necessário ou lida com elas
  if (event.request.url.includes('googleSearch') || event.request.url.includes('gemini')) {
    return; // Deixa o navegador lidar com chamadas de IA normalmente (precisam de rede)
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Atualiza o cache com a nova resposta
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Se falhar e não houver cache, você pode retornar uma página offline aqui
      });

      return cachedResponse || fetchPromise;
    })
  );
});
