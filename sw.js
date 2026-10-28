/*
 * Service worker: guarda la web para poder verla sin conexión.
 * - Páginas: primero la red; si no hay conexión, la copia guardada.
 * - Resto de archivos (CSS, JS, fotos, fuentes): se sirve la copia guardada y se actualiza en segundo plano.
 * Al publicar cambios importantes, sube VERSION para que todos reciban los archivos nuevos.
 */
var VERSION = "chimigo-v1";

var ESENCIALES = [
  "./",
  "index.html",
  "manifest.json",
  "css/styles.css",
  "js/config.js",
  "js/menu.js",
  "js/galeria-datos.js",
  "js/i18n.js",
  "js/main.js",
  "js/carta.js",
  "js/galeria.js",
  "img/favicon.svg",
  "img/icon-192.png",
  "img/hero.webp",
  "img/hero-movil.webp",
];

// Otros orígenes que se pueden guardar (las fuentes). El mapa y las plataformas no se guardan.
var EXTERNOS = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(VERSION)
      .then(function (cache) {
        return cache.addAll(ESENCIALES);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (claves) {
        return Promise.all(
          claves
            .filter(function (clave) {
              return clave !== VERSION;
            })
            .map(function (clave) {
              return caches.delete(clave);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

function guardarEnCache(peticion, respuesta) {
  if (respuesta && (respuesta.ok || respuesta.type === "opaque")) {
    var copia = respuesta.clone();
    caches.open(VERSION).then(function (cache) {
      cache.put(peticion, copia);
    });
  }
  return respuesta;
}

self.addEventListener("fetch", function (event) {
  var peticion = event.request;
  if (peticion.method !== "GET") return;

  var url = new URL(peticion.url);
  var mismoOrigen = url.origin === self.location.origin;
  if (!mismoOrigen && EXTERNOS.indexOf(url.origin) === -1) return;

  if (peticion.mode === "navigate") {
    event.respondWith(
      fetch(peticion)
        .then(function (respuesta) {
          return guardarEnCache(peticion, respuesta);
        })
        .catch(function () {
          return caches.match(peticion).then(function (guardada) {
            return guardada || caches.match("index.html");
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(peticion).then(function (guardada) {
      var red = fetch(peticion)
        .then(function (respuesta) {
          return guardarEnCache(peticion, respuesta);
        })
        .catch(function () {
          return guardada;
        });
      return guardada || red;
    })
  );
});
