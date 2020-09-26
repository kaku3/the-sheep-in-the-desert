if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/pwa/sw.js')
    .then((r) => {
        console.info('Service worker registered.', r)
    })
}