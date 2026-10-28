(function () {
  "use strict";

  var cfg = window.CHIMIGO || {};
  var carta = window.CHIMIGO_MENU || { categorias: [], platos: [] };
  var utils = window.ChimiGo || {};
  var has = utils.has;
  var enlaces = utils.enlaces || {};
  var i18n = window.ChimiGoI18n;
  var t = i18n.t;

  var CLAVE_GUARDADO = "chimigo-carrito";
  var MAX_CANTIDAD = 20;
  var TODO = "*";
  // El mensaje de WhatsApp va siempre en español, que es como lo lee el local.
  var MODOS = { recoger: "Para recoger", local: "Para tomar en el local" };

  var formatoPrecio = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
  function precio(n) {
    return formatoPrecio.format(n);
  }

  var porId = {};
  carta.platos.forEach(function (p) {
    porId[p.id] = p;
  });

  var extras = carta.extras || [];
  var extraPorId = {};
  extras.forEach(function (e) {
    extraPorId[e.id] = e;
  });

  function $(selector, raiz) {
    return (raiz || document).querySelector(selector);
  }

  function crear(etiqueta, clase, texto) {
    var el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  function nombreCategoria(c) {
    return (i18n.idioma() === "en" && carta.categoriasEn && carta.categoriasEn[c]) || c;
  }

  function nombreExtra(e) {
    return i18n.campo(e, "nombre");
  }

  function reduceMovimiento() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // ---------- Avisos para lectores de pantalla ----------

  var aviso = $("[data-aviso]");
  function anunciar(texto) {
    if (!aviso) return;
    aviso.textContent = "";
    setTimeout(function () {
      aviso.textContent = texto;
    }, 50);
  }

  // ---------- Foto o marcador ----------

  // Marcador con el nombre del plato; si hay foto, la tapa al cargar (WebP con JPG de respaldo).
  function media(plato, grande) {
    var categoria = Math.max(carta.categorias.indexOf(plato.categoria), 0) % 3;
    var figura = crear("div", "menu-media menu-media--cat" + categoria + (grande ? " menu-media--grande" : ""));
    var marcador = crear("div", "menu-media-marcador");
    marcador.setAttribute("aria-hidden", "true");
    marcador.append(crear("span", "menu-media-cat", nombreCategoria(plato.categoria)), crear("span", "menu-media-nombre", plato.nombre));
    figura.append(marcador);

    var foto = plato.foto;
    if (foto) {
      var picture = document.createElement("picture");
      var webp = document.createElement("source");
      webp.type = "image/webp";
      webp.srcset = foto.webp;
      var img = new Image(foto.ancho, foto.alto);
      img.alt = plato.nombre;
      img.loading = grande ? "eager" : "lazy";
      img.decoding = "async";
      img.onload = function () {
        figura.classList.add("menu-media--foto");
      };
      img.onerror = function () {
        picture.remove();
      };
      img.src = foto.jpg;
      picture.append(webp, img);
      figura.append(picture);
    }
    return figura;
  }

  // ---------- Carrito: estado ----------

  // Cada línea se guarda con una clave "plato+extra+extra", de modo que el mismo plato
  // con distintos extras ocupa líneas distintas.
  function clave(id, idsExtras) {
    return [id].concat(idsExtras.slice().sort()).join("+");
  }

  function desdeClave(k) {
    var partes = k.split("+");
    var plato = porId[partes[0]];
    var lista = partes.slice(1).map(function (id) {
      return extraPorId[id];
    });
    if (!plato || lista.some(function (e) { return !e; }) || (lista.length && !plato.extras)) return null;
    return { plato: plato, extras: lista };
  }

  var estado = leer();

  function leer() {
    var vacio = { lineas: {}, nota: "", modo: "recoger" };
    try {
      var guardado = JSON.parse(localStorage.getItem(CLAVE_GUARDADO));
      if (!guardado || typeof guardado !== "object") return vacio;
      var lineas = {};
      Object.keys(guardado.lineas || {}).forEach(function (k) {
        var n = parseInt(guardado.lineas[k], 10);
        if (desdeClave(k) && n > 0) lineas[k] = Math.min(n, MAX_CANTIDAD);
      });
      return {
        lineas: lineas,
        nota: typeof guardado.nota === "string" ? guardado.nota : "",
        modo: MODOS[guardado.modo] ? guardado.modo : "recoger",
      };
    } catch (e) {
      return vacio;
    }
  }

  function guardar() {
    try {
      localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(estado));
    } catch (e) {
      // Sin almacenamiento (modo privado, bloqueado…): el carrito sigue funcionando en esta visita.
    }
  }

  function precioUnidad(plato, lista) {
    return lista.reduce(function (total, e) {
      return total + e.precio;
    }, plato.precio);
  }

  // enEspanol: para el mensaje de WhatsApp, que siempre va en español.
  function nombreLinea(l, enEspanol) {
    if (!l.extras.length) return l.plato.nombre;
    return (
      l.plato.nombre +
      " (+ " +
      l.extras
        .map(function (e) {
          return enEspanol ? e.nombre : nombreExtra(e);
        })
        .join(", ") +
      ")"
    );
  }

  function lineas() {
    return Object.keys(estado.lineas)
      .map(function (k) {
        var d = desdeClave(k);
        if (!d) return null;
        var unidad = precioUnidad(d.plato, d.extras);
        var cantidad = estado.lineas[k];
        return { clave: k, plato: d.plato, extras: d.extras, unidad: unidad, cantidad: cantidad, subtotal: unidad * cantidad };
      })
      .filter(Boolean);
  }

  function resumen() {
    return lineas().reduce(
      function (r, l) {
        r.cantidad += l.cantidad;
        r.total += l.subtotal;
        return r;
      },
      { cantidad: 0, total: 0 }
    );
  }

  function fijarCantidad(k, cantidad) {
    cantidad = Math.max(0, Math.min(MAX_CANTIDAD, cantidad));
    if (cantidad) estado.lineas[k] = cantidad;
    else delete estado.lineas[k];
    guardar();
    pintarCarrito();
  }

  function anadir(id, idsExtras, cantidad) {
    var k = clave(id, idsExtras);
    fijarCantidad(k, (estado.lineas[k] || 0) + cantidad);
    var d = desdeClave(k);
    anunciar(t("carrito.anunciado", { cantidad: cantidad, nombre: nombreLinea(d), total: precio(resumen().total) }));
    animarBoton();
  }

  // ---------- Mensaje de WhatsApp ----------

  function mensajeWhatsApp() {
    var r = resumen();
    var texto = ["¡Hola, " + (cfg.nombre || "") + "! Quiero hacer un pedido:", ""];
    lineas().forEach(function (l) {
      texto.push("• " + l.cantidad + " × " + nombreLinea(l, true) + " — " + precio(l.subtotal));
    });
    texto.push("", "Total orientativo: " + precio(r.total));
    texto.push("Modalidad: " + MODOS[estado.modo]);
    if (estado.nota.trim()) texto.push("Nota: " + estado.nota.trim());
    texto.push("", "¿Me confirmáis el total y cuándo estará listo? ¡Gracias!");
    // Intl usa espacios de no separación; se cambian por espacios normales para WhatsApp.
    return texto.join("\n").replace(/\u00a0/g, " ");
  }

  function urlWhatsApp() {
    return enlaces.whatsapp + "?text=" + encodeURIComponent(mensajeWhatsApp());
  }

  // ---------- Menú ----------

  var lista = $("[data-menu-lista]");
  var pestanas = $("[data-menu-tabs]");
  var ficha = document.getElementById("ficha");
  var carrito = document.getElementById("carrito");

  function tarjeta(plato) {
    var articulo = crear("article", "menu-card");
    articulo.dataset.categoria = plato.categoria;

    var abrir = crear("button", "menu-card-open");
    abrir.type = "button";
    abrir.setAttribute("aria-haspopup", "dialog");
    abrir.append(crear("span", "visually-hidden", t("carta.verFicha")), document.createTextNode(plato.nombre));
    abrir.addEventListener("click", function () {
      abrirFicha(plato);
    });

    var titulo = crear("h4");
    titulo.append(abrir);

    var cuerpo = crear("div", "menu-card-body");
    if (plato.etiquetas && plato.etiquetas.length) {
      var etiquetas = crear("ul", "menu-tags");
      plato.etiquetas.forEach(function (etiqueta) {
        var texto = i18n.idioma() === "en" ? t("etiqueta." + etiqueta) : etiqueta;
        etiquetas.append(crear("li", "", texto));
      });
      cuerpo.append(etiquetas);
    }
    cuerpo.append(titulo);
    var descripcion = i18n.campo(plato, "descripcion");
    if (descripcion) cuerpo.append(crear("p", "", descripcion));

    var pie = crear("div", "menu-card-foot");
    var boton = crear("button", "btn btn-primary btn-small btn-add");
    boton.type = "button";
    textoBoton(boton, "+", t("carta.anadir"));
    boton.setAttribute("aria-label", t("carta.anadirAria", { nombre: plato.nombre }));
    boton.addEventListener("click", function () {
      anadir(plato.id, [], 1);
      confirmar(boton);
    });
    pie.append(crear("span", "price", precio(plato.precio)), boton);

    articulo.append(media(plato, false), cuerpo, pie);
    return articulo;
  }

  function textoBoton(boton, simbolo, texto) {
    var icono = crear("span", "", simbolo);
    icono.setAttribute("aria-hidden", "true");
    boton.replaceChildren(icono, document.createTextNode(" " + texto));
  }

  function confirmar(boton) {
    boton.classList.remove("is-added");
    void boton.offsetWidth;
    boton.classList.add("is-added");
    textoBoton(boton, "✓", t("carta.anadido"));
    clearTimeout(boton._t);
    boton._t = setTimeout(function () {
      boton.classList.remove("is-added");
      textoBoton(boton, "+", t("carta.anadir"));
    }, 1400);
  }

  function pintarCarta() {
    carta.categorias.forEach(function (nombre) {
      var platos = carta.platos.filter(function (p) {
        return p.categoria === nombre;
      });
      if (!platos.length) return;
      var seccion = crear("section", "menu-category");
      seccion.dataset.categoria = nombre;
      var rejilla = crear("div", "menu-grid");
      platos.forEach(function (p) {
        rejilla.append(tarjeta(p));
      });
      seccion.append(crear("h3", "menu-category-title", nombreCategoria(nombre)), rejilla);
      lista.append(seccion);
    });
  }

  function filtrar(categoria) {
    lista.querySelectorAll(".menu-category").forEach(function (s) {
      s.hidden = categoria !== TODO && s.dataset.categoria !== categoria;
    });
  }

  var pestanaActiva = 0;

  function pintarPestanas() {
    var nombres = [TODO].concat(carta.categorias);
    var botones = nombres.map(function (nombre, i) {
      var b = crear("button", "menu-tab", nombre === TODO ? t("carta.todo") : nombreCategoria(nombre));
      b.dataset.categoria = nombre;
      b.type = "button";
      b.id = "pestana-" + i;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-controls", lista.id);
      pestanas.append(b);
      return b;
    });

    function seleccionar(b, enfocar) {
      botones.forEach(function (o) {
        var activo = o === b;
        o.setAttribute("aria-selected", activo ? "true" : "false");
        o.tabIndex = activo ? 0 : -1;
      });
      lista.setAttribute("aria-labelledby", b.id);
      pestanaActiva = botones.indexOf(b);
      filtrar(b.dataset.categoria);
      if (enfocar) b.focus();
    }

    botones.forEach(function (b, i) {
      b.addEventListener("click", function () {
        seleccionar(b, false);
      });
      b.addEventListener("keydown", function (e) {
        var destino = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: botones.length - 1 }[e.key];
        if (destino === undefined) return;
        e.preventDefault();
        seleccionar(botones[(destino + botones.length) % botones.length], true);
      });
    });

    seleccionar(botones[pestanaActiva] || botones[0], false);
  }

  // ---------- Ficha del plato ----------

  var fichaPlato = null;
  var fichaCantidad = 1;
  var foco = null;

  function extrasElegidos() {
    return Array.prototype.map.call(ficha.querySelectorAll("[data-ficha-extras] input:checked"), function (i) {
      return extraPorId[i.value];
    });
  }

  function pintarFicha() {
    var unidad = precioUnidad(fichaPlato, extrasElegidos());
    $("[data-ficha-cantidad]", ficha).textContent = fichaCantidad;
    $("[data-ficha-menos]", ficha).disabled = fichaCantidad <= 1;
    $("[data-ficha-mas]", ficha).disabled = fichaCantidad >= MAX_CANTIDAD;
    $("[data-ficha-precio]", ficha).textContent = precio(unidad);
    $("[data-ficha-anadir]", ficha).textContent = t("ficha.anadirPrecio", { precio: precio(unidad * fichaCantidad) });
  }

  function pintarExtras(plato) {
    var grupo = $("[data-ficha-extras]", ficha);
    var contenedor = $("[data-ficha-extras-lista]", ficha);
    contenedor.replaceChildren();
    grupo.hidden = !(plato.extras && extras.length);
    if (grupo.hidden) return;
    extras.forEach(function (e) {
      var etiqueta = crear("label", "dish-extra");
      var casilla = crear("input");
      casilla.type = "checkbox";
      casilla.value = e.id;
      casilla.addEventListener("change", pintarFicha);
      etiqueta.append(casilla, crear("span", "dish-extra-name", nombreExtra(e)), crear("span", "dish-extra-price", "+ " + precio(e.precio)));
      contenedor.append(etiqueta);
    });
  }

  function abrirFicha(plato) {
    fichaPlato = plato;
    fichaCantidad = 1;
    foco = document.activeElement;
    $("[data-ficha-media]", ficha).replaceChildren(media(plato, true));
    var descripcion = i18n.campo(plato, "descripcion");
    $("[data-ficha-cat]", ficha).textContent = nombreCategoria(plato.categoria);
    $("[data-ficha-nombre]", ficha).textContent = plato.nombre;
    $("[data-ficha-desc]", ficha).textContent = descripcion;
    $("[data-ficha-desc]", ficha).hidden = !descripcion;
    pintarExtras(plato);
    $("[data-ficha-alergenos]", ficha).textContent =
      plato.alergenos && plato.alergenos.length
        ? t("carta.alergenos", { lista: plato.alergenos.join(", ") })
        : t("carta.alergenosConsulta");
    pintarFicha();
    ficha.showModal();
  }

  function iniciarFicha() {
    $("[data-ficha-menos]", ficha).addEventListener("click", function () {
      fichaCantidad = Math.max(1, fichaCantidad - 1);
      pintarFicha();
    });
    $("[data-ficha-mas]", ficha).addEventListener("click", function () {
      fichaCantidad = Math.min(MAX_CANTIDAD, fichaCantidad + 1);
      pintarFicha();
    });
    $("[data-ficha-anadir]", ficha).addEventListener("click", function () {
      anadir(
        fichaPlato.id,
        extrasElegidos().map(function (e) {
          return e.id;
        }),
        fichaCantidad
      );
      ficha.close();
    });
    prepararDialogo(ficha);
  }

  // Cierre al pulsar fuera y devolución del foco al cerrar.
  function prepararDialogo(dialogo) {
    dialogo.addEventListener("click", function (e) {
      if (e.target === dialogo) dialogo.close();
    });
    dialogo.querySelectorAll("[data-cerrar]").forEach(function (b) {
      b.addEventListener("click", function () {
        dialogo.close();
      });
    });
    dialogo.addEventListener("close", function () {
      if (foco && document.contains(foco) && !foco.closest("dialog")) foco.focus();
    });
  }

  // ---------- Carrito: interfaz ----------

  var fab = $("[data-carrito-abrir]");

  function pintarCarrito() {
    var r = resumen();
    var vacio = r.cantidad === 0;
    var etiquetaCuenta = t(r.cantidad === 1 ? "carrito.producto" : "carrito.productos", { n: r.cantidad });

    fab.hidden = vacio;
    $("[data-fab-cuenta]", fab).textContent = r.cantidad;
    $("[data-fab-total]", fab).textContent = precio(r.total);
    fab.setAttribute("aria-label", t("carrito.verPedido", { cuenta: etiquetaCuenta, total: precio(r.total) }));

    $("[data-carrito-vacio]", carrito).hidden = !vacio;
    $("[data-carrito-opciones]", carrito).hidden = vacio;
    $("[data-carrito-pie]", carrito).hidden = vacio;
    $("[data-carrito-total]", carrito).textContent = precio(r.total);
    $("[data-carrito-cuenta]", carrito).textContent = vacio ? "" : etiquetaCuenta;

    var ul = $("[data-carrito-lineas]", carrito);
    ul.replaceChildren();
    lineas().forEach(function (l) {
      var li = crear("li", "cart-line");
      var info = crear("div", "cart-line-info");
      var nombre = nombreLinea(l);
      info.append(crear("span", "cart-line-name", l.plato.nombre));
      if (l.extras.length) {
        info.append(crear("span", "cart-line-extras", "+ " + l.extras.map(nombreExtra).join(", ")));
      }
      info.append(crear("span", "cart-line-unit", t("carrito.unidad", { precio: precio(l.unidad) })));

      var cantidad = crear("div", "qty qty--small");
      cantidad.setAttribute("role", "group");
      cantidad.setAttribute("aria-label", t("carrito.cantidadDe", { nombre: nombre }));
      var menos = crear("button", "qty-btn", "−");
      menos.type = "button";
      menos.setAttribute("aria-label", t("carrito.menos", { nombre: nombre }));
      menos.addEventListener("click", function () {
        fijarCantidad(l.clave, l.cantidad - 1);
        devolverFoco(l.clave, "menos");
      });
      var mas = crear("button", "qty-btn", "+");
      mas.type = "button";
      mas.disabled = l.cantidad >= MAX_CANTIDAD;
      mas.setAttribute("aria-label", t("carrito.mas", { nombre: nombre }));
      mas.addEventListener("click", function () {
        fijarCantidad(l.clave, l.cantidad + 1);
        devolverFoco(l.clave, "mas");
      });
      menos.dataset.foco = l.clave + "-menos";
      mas.dataset.foco = l.clave + "-mas";
      cantidad.append(menos, crear("span", "qty-value", String(l.cantidad)), mas);

      var quitar = crear("button", "cart-line-remove", t("carrito.quitar"));
      quitar.type = "button";
      quitar.setAttribute("aria-label", t("carrito.quitarAria", { nombre: nombre }));
      quitar.addEventListener("click", function () {
        fijarCantidad(l.clave, 0);
        anunciar(t("carrito.quitado", { nombre: nombre }));
        var siguiente = $(".cart-line-remove", carrito) || $("[data-cerrar]", carrito);
        siguiente.focus();
      });

      li.append(info, cantidad, crear("span", "cart-line-total", precio(l.subtotal)), quitar);
      ul.append(li);
    });

    var whatsapp = $("[data-carrito-whatsapp]", carrito);
    if (has(enlaces.whatsapp)) {
      whatsapp.hidden = false;
      whatsapp.href = urlWhatsApp();
    }
  }

  // Tras repintar, el foco vuelve al mismo botón (o a "Quitar" si la línea desapareció).
  function devolverFoco(id, cual) {
    var boton = $('[data-foco="' + id + "-" + cual + '"]', carrito);
    if (boton && !boton.disabled) return boton.focus();
    var alternativo = $('[data-foco="' + id + '-menos"]', carrito) || $(".cart-line-remove", carrito) || $("[data-cerrar]", carrito);
    alternativo.focus();
  }

  function animarBoton() {
    if (fab.hidden || reduceMovimiento()) return;
    fab.classList.remove("is-bump");
    void fab.offsetWidth;
    fab.classList.add("is-bump");
  }

  function iniciarCarrito() {
    var nota = $("#carrito-nota", carrito);
    nota.value = estado.nota;
    nota.addEventListener("input", function () {
      estado.nota = nota.value;
      guardar();
      pintarCarrito();
    });

    carrito.querySelectorAll('input[name="modo"]').forEach(function (radio) {
      radio.checked = radio.value === estado.modo;
      radio.addEventListener("change", function () {
        estado.modo = radio.value;
        guardar();
        pintarCarrito();
      });
    });

    var alternativa = $("[data-carrito-alternativa]", carrito);
    if (!has(enlaces.whatsapp)) {
      $("[data-carrito-whatsapp]", carrito).remove();
      alternativa.hidden = false;
      pintarAlternativa(alternativa);
    }

    $("[data-carrito-ver-menu]", carrito).addEventListener("click", function () {
      carrito.close();
    });

    fab.addEventListener("click", function () {
      foco = fab;
      carrito.showModal();
    });
    fab.addEventListener("animationend", function () {
      fab.classList.remove("is-bump");
    });

    prepararDialogo(carrito);
    pintarCarrito();
  }

  // "Pide en el local, llamando al … o por Instagram", según los datos que haya.
  function pintarAlternativa(p) {
    var opciones = [];
    if (has(enlaces.telefono)) {
      var tel = crear("a", "", cfg.contacto.telefono.replace(/^\+34\s*/, ""));
      tel.href = enlaces.telefono;
      opciones.push([document.createTextNode(t("carrito.altTelefono")), tel]);
    }
    if (has(enlaces.instagram)) {
      var ig = crear("a", "", "Instagram");
      ig.href = enlaces.instagram;
      ig.target = "_blank";
      ig.rel = "noopener noreferrer";
      opciones.push([document.createTextNode(t("carrito.altInstagram")), ig]);
    }
    p.replaceChildren(document.createTextNode(t("carrito.altInicio")));
    opciones.forEach(function (o, i) {
      p.append(document.createTextNode(i === 0 ? ", " : t("carrito.altO")));
      p.append.apply(p, o);
    });
    p.append(document.createTextNode("."));
  }

  // ---------- Arranque ----------

  if (!lista || !pestanas || !ficha || !carrito || !fab || !has) return;

  pintarCarta();
  pintarPestanas();
  iniciarFicha();
  iniciarCarrito();

  // Al cambiar de idioma se rehace la carta conservando la pestaña elegida.
  document.addEventListener("chimigo:idioma", function () {
    if (ficha.open) ficha.close();
    pestanas.replaceChildren();
    lista.replaceChildren();
    pintarCarta();
    pintarPestanas();
    if (!has(enlaces.whatsapp)) pintarAlternativa($("[data-carrito-alternativa]", carrito));
    pintarCarrito();
  });

  // Sincroniza el carrito si se cambia en otra pestaña.
  window.addEventListener("storage", function (e) {
    if (e.key !== CLAVE_GUARDADO) return;
    estado = leer();
    $("#carrito-nota", carrito).value = estado.nota;
    pintarCarrito();
  });
})();
