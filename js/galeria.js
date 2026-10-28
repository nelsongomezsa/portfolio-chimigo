(function () {
  "use strict";

  var fotos = window.CHIMIGO_GALERIA || [];
  var i18n = window.ChimiGoI18n;
  var t = i18n.t;
  var crear = (window.ChimiGo || {}).crear;

  var lista = document.querySelector("[data-galeria]");
  var dialogo = document.getElementById("lightbox");
  if (!lista || !dialogo || !crear) return;

  var seccion = lista.closest("section");
  if (!fotos.length) {
    seccion.hidden = true;
    return;
  }

  var actual = 0;
  var foco = null;
  var medio = dialogo.querySelector("[data-lightbox-media]");
  var pie = dialogo.querySelector("[data-lightbox-pie]");
  var cuenta = dialogo.querySelector("[data-lightbox-cuenta]");

  function picture(foto, lazy) {
    var p = document.createElement("picture");
    var fuente = document.createElement("source");
    fuente.type = "image/webp";
    fuente.srcset = foto.webp;
    var img = new Image(foto.ancho, foto.alto);
    img.alt = i18n.campo(foto, "alt");
    img.decoding = "async";
    if (lazy) img.loading = "lazy";
    img.src = foto.jpg;
    p.append(fuente, img);
    return p;
  }

  function pintarMiniaturas() {
    lista.replaceChildren();
    fotos.forEach(function (foto, i) {
      var li = crear("li", "gallery-item");
      var boton = crear("button", "gallery-thumb");
      boton.type = "button";
      boton.setAttribute("aria-haspopup", "dialog");
      boton.setAttribute("aria-label", t("galeria.ver", { n: i + 1, total: fotos.length, alt: i18n.campo(foto, "alt") }));
      var imagen = picture(foto, true);
      imagen.querySelector("img").alt = "";
      boton.append(imagen);
      boton.addEventListener("click", function () {
        abrir(i);
      });
      li.append(boton);
      lista.append(li);
    });
  }

  function mostrar(i) {
    actual = (i + fotos.length) % fotos.length;
    var foto = fotos[actual];
    medio.replaceChildren(picture(foto, false));
    pie.textContent = i18n.campo(foto, "alt");
    cuenta.textContent = t("galeria.cuenta", { n: actual + 1, total: fotos.length });
  }

  function abrir(i) {
    foco = document.activeElement;
    mostrar(i);
    dialogo.showModal();
  }

  dialogo.querySelector("[data-lightbox-anterior]").addEventListener("click", function () {
    mostrar(actual - 1);
  });
  dialogo.querySelector("[data-lightbox-siguiente]").addEventListener("click", function () {
    mostrar(actual + 1);
  });
  dialogo.querySelector("[data-cerrar]").addEventListener("click", function () {
    dialogo.close();
  });

  // Teclado: flechas para pasar, Inicio y Fin para ir al principio o al final. Esc cierra (nativo de <dialog>).
  dialogo.addEventListener("keydown", function (e) {
    var destino = { ArrowLeft: actual - 1, ArrowRight: actual + 1, Home: 0, End: fotos.length - 1 }[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    mostrar(destino);
  });

  dialogo.addEventListener("click", function (e) {
    if (e.target === dialogo) dialogo.close();
  });

  dialogo.addEventListener("close", function () {
    if (foco && document.contains(foco)) foco.focus();
  });

  // Deslizar en móvil: más de 50 px en horizontal pasa de foto.
  var inicioX = null;
  var inicioY = null;
  medio.addEventListener("pointerdown", function (e) {
    inicioX = e.clientX;
    inicioY = e.clientY;
  });
  medio.addEventListener("pointerup", function (e) {
    if (inicioX === null) return;
    var dx = e.clientX - inicioX;
    var dy = e.clientY - inicioY;
    inicioX = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) mostrar(actual + (dx < 0 ? 1 : -1));
  });
  medio.addEventListener("pointercancel", function () {
    inicioX = null;
  });

  pintarMiniaturas();

  document.addEventListener("chimigo:idioma", function () {
    pintarMiniaturas();
    if (dialogo.open) mostrar(actual);
  });
})();
