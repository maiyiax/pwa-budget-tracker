const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    "./index.html",
    "./css/styles.css",
    "./js/index.js",
    "./js/idb.js",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"

]

// event listener for install event
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

// event listener for activate event, delete old caches
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeeplist = keyList.filter(function (key) {
                return key,indexOf(APP_PREFIX);
            })
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function(key, i) {
                    if (cacheKeeplist.indexOf(key) === -1) {
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});


self.addEventListener('fetch', function (e) {
    // intercept fetch request and see if request is stored in cache
    e.respondWith(
        caches.match(e.request).then(function (request) {
            // if cached, deliver resource directly from cache
            if (request) {
                return request
            } else {
                // retrieve from online using normal route
                return fetch(e.request)
            }
        })
    )
})