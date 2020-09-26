if('serviceWorker' in navigator) {
    const serviceWorkerJs = `${location.href}sw.js`
    console.info('register service worker : ', serviceWorkerJs)
    navigator.serviceWorker.register(serviceWorkerJs)
    .then((r) => {
        console.info('Service worker registered.', r)
    })
}