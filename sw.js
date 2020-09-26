// pwa/ 以下に pwa 関連のファイルをまとめたかったが、service worker はルートに配置する必要がある。

// workbox の import
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');
workbox.loadModule('workbox-strategies');

const precacheController = new workbox.precaching.PrecacheController();

const REVISION = '0.01'
const baseUrl = location.href.replace(/\/sw.js$/, '');
const urls = [
    { url:'/index.html', revision: REVISION },
    { url:'/css/fonts.css', revision: REVISION },
    { url:'/css/main.css', revision: REVISION },
    { url:'/css/sns.css', revision: REVISION },
    { url:'/font/VT323/OFL.txt', revision: REVISION },
    { url:'/font/VT323/VT323-Regular.ttf', revision: REVISION },
    { url:'/image/bg.png', revision: REVISION },
    { url:'/image/horn.png', revision: REVISION },
    { url:'/image/player-attack.png', revision: REVISION },
    { url:'/image/player-stand.png', revision: REVISION },
    { url:'/image/sheep.png', revision: REVISION },
    { url:'/image/sight.png', revision: REVISION },
    { url:'/image/smoke.png', revision: REVISION },
    { url:'/js/global.js', revision: REVISION },
    { url:'/js/horn.js', revision: REVISION },
    { url:'/js/main.js', revision: REVISION },
    { url:'/js/sheep.js', revision: REVISION },
    { url:'/js/smoke.js', revision: REVISION }
].map(o => {
    o.url = baseUrl + o.url;
    return o;
})
console.log(urls)

precacheController.addToCacheList(urls);

self.addEventListener('install', (event) => {
    event.waitUntil(precacheController.install());
});
self.addEventListener('activate', (event) => {
    event.waitUntil(precacheController.activate());
});
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches
            .match(event.request)
            .then(function(response) {
                return response ? response : fetch(event.request);
            })
    );
});
