// workbox の import
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');
workbox.loadModule('workbox-strategies');

const precacheController = new workbox.precaching.PrecacheController();

console.log('sw', location.href)
const baseUrl = location.href.replace(/\/pwa\/sw.js$/, '');
const urls = [
    { url:'/index.html', revision: '0.01' },
    { url:'/css/fonts.css', revision: '0.01' },
    { url:'/css/main.css', revision: '0.01' },
    { url:'/css/sns.css', revision: '0.01' },
    { url:'/font/VT323/OFL.txt', revision: '0.01' },
    { url:'/font/VT323/VT323-Regular.ttf', revision: '0.01' },
    { url:'/image/bg.png', revision: '0.01' },
    { url:'/image/horn.png', revision: '0.01' },
    { url:'/image/player-attack.png', revision: '0.01' },
    { url:'/image/player-stand.png', revision: '0.01' },
    { url:'/image/sheep.png', revision: '0.01' },
    { url:'/image/sight.png', revision: '0.01' },
    { url:'/image/smoke.png', revision: '0.01' },
    { url:'/js/global.js', revision: '0.01' },
    { url:'/js/horn.js', revision: '0.01' },
    { url:'/js/main.js', revision: '0.01' },
    { url:'/js/sheep.js', revision: '0.01' },
    { url:'/js/smoke.js', revision: '0.01' }
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
