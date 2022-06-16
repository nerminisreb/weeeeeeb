'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "ee9ef59152f028307cf162bc55c4f3a8",
"assets/assets/images/A%2520class%2520that%2520deserves%2520to%2520be%2520killed.png": "32577783e519246b74c80a79d13daf6b",
"assets/assets/images/About%2520a%2520homeland%2520of%2520flesh%2520and%2520blood.png": "d336a925692dab200db27a7cf5327f7c",
"assets/assets/images/bg.png": "608100cc81f77156814198b48e034dbb",
"assets/assets/images/Bitmap.jpg": "35f461807efdacc34123c49b1fb9839c",
"assets/assets/images/Bitmap.png": "5b2680359ecfa1e0efc3dc47a9e4d515",
"assets/assets/images/book%2520logo.jpg": "b8428ba799003cc44f8299d122bebf30",
"assets/assets/images/bozuk.png": "21348b7a8778c55e3de381d4ffe3b9cf",
"assets/assets/images/duvar.png": "608100cc81f77156814198b48e034dbb",
"assets/assets/images/halk.png": "0130081dd861e679e1de3c66192fe98e",
"assets/assets/images/heart%2520beat.png": "16f571b1c4c8355bd1c634aa5d80647d",
"assets/assets/images/Just%2520for%2520men.png": "1fdb65a55c8c6f655aa5afd63db35844",
"assets/assets/images/kill.png": "b16e4defcbf0404f35cf7e2808c57da0",
"assets/assets/images/kukla.png": "da7b9d0b96ba3bc902aef7cb019fb84c",
"assets/assets/images/Les%2520Miserables.png": "b2892adf91f8039710d5c3a76c027ae7",
"assets/assets/images/login.png": "6c9c05c35d940677a0cfe48831088b7e",
"assets/assets/images/Morning%2520talk.png": "f7ed0993dab7ef6ee966768a809598aa",
"assets/assets/images/signup.png": "1f70e81ba62415c673cfcc47f0002145",
"assets/assets/images/small.png": "e3de12a27b0f780db44d297e26469fcd",
"assets/assets/images/sure%2520news.png": "433986d006d6457e747175d873e07009",
"assets/assets/images/The%2520Kite%2520Runner.png": "9ac1fd6397cae4066ad6b1c07090c4d7",
"assets/assets/images/those%2520days.png": "bc7095e5f4d55cb8ddfc2b186a90f1ba",
"assets/assets/images/wall.png": "afd979893737e704c3ca3a0b4d5e0456",
"assets/assets/images/Yazraail.png": "754ab65b3f5d5d315246fb34b9906218",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/NOTICES": "2d7236aca695ba4cd213a3478e55d740",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "c1dde6fea657564e0110096d1f6bdfed",
"/": "c1dde6fea657564e0110096d1f6bdfed",
"main.dart.js": "78fb02db10404d3b93479cd18677d7a4",
"manifest.json": "a887a78224f487168c4e3561fd8c0d6f",
"version.json": "9ae7ecbaa50e9346fa9c670df7deba32"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
