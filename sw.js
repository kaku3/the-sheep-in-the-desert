// pwa/ 以下に pwa 関連のファイルをまとめたかったが、service worker はルートに配置する必要がある。

// workbox の import
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');
workbox.loadModule('workbox-strategies');

const precacheController = new workbox.precaching.PrecacheController();

console.log('sw', location.href)
const baseUrl = location.href.replace(/\/sw.js$/, '');
const urls = [
    { url:'/index.html' },
    { url:'/css/fonts.css' },
    { url:'/css/main.css' },
    { url:'/css/sns.css' },
    { url:'/font/VT323/OFL.txt' },
    { url:'/font/VT323/VT323-Regular.ttf' },
    { url:'/image/bg.png' },
    { url:'/image/horn.png' },
    { url:'/image/player-attack.png' },
    { url:'/image/player-stand.png' },
    { url:'/image/sheep.png' },
    { url:'/image/sight.png' },
    { url:'/image/smoke.png' },
    { url:'/js/global.js' },
    { url:'/js/horn.js' },
    { url:'/js/main.js' },
    { url:'/js/sheep.js' },
    { url:'/js/smoke.js' }
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
    event.waitUntil(precacheController.cleanup());
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
