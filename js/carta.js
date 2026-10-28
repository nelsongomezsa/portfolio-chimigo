(function () {
  "use strict";

  var cfg = window.CHIMIGO || {};
  var carta = window.CHIMIGO_MENU || { categorias: [], platos: [] };
  var utils = window.ChimiGo || {};
  var has = utils.has;
  var enlaces = utils.enlaces || {};

  var CLAVE_GUARDADO = "chimigo-carrito";
  var MAX_CANTIDAD = 20;
  var MODOS = { recoger: "Para recoger", local: "Para tomar en el local" };

  var formatoPrecio = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
  function precio(n) {
    return formatoPrecio.format(n);
  }

  var porId = {};
  carta.platos.forEach(function (p) {
    porId[p.id] = p;
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

  // Marcador con el nombre del plato; si la foto existe, la tapa al cargar.
  function media(plato, grande) {
    var categoria = carta.categorias.indexOf(plato.categoria);
    var figura = crear("div", "menu-media menu-media--cat" + Math.max(categoria, 0) + (grande ? " menu-media--grande" : ""));
    var marcador = crear("div", "menu-media-marcador");
    marcador.setAttribute("aria-hidden", "true");
    marcador.append(crear("span", "menu-media-cat", plato.categoria), crear("span", "menu-media-nombre", plato.nombre));
    figura.append(marcador);

    if (plato.imagen) {
      var img = new Image(800, 600);
      img.alt = plato.alt || plato.nombre;
      img.loading = grande ? "eager" : "lazy";
      img.decoding = "async";
      img.onload = function () {
        figura.classList.add("menu-media--foto");
      };
      img.onerror = function () {
        img.remove();
      };
      img.src = plato.imagen;
      figura.append(img);
    }
    return figura;
  }

  // ---------- Carrito: estado ----------

  var estado = leer();

  function leer() {
    var vacio = { lineas: {}, nota: "", modo: "recoger" };
    try {
      var guardado = JSON.parse(localStorage.getItem(CLAVE_GUARDADO));
      if (!guardado || typeof guardado !== "object") return vacio;
      var lineas = {};
      Object.keys(guardado.lineas || {}).forEach(function (id) {
        var n = parseInt(guardado.lineas[id], 10);
        if (porId[id] && n > 0) lineas[id] = Math.min(n, MAX_CANTIDAD);
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

  function lineas() {
    return carta.platos
      .filter(function (p) {
        return estado.lineas[p.id];
      })
      .map(function (p) {
        return { plato: p, cantidad: estado.lineas[p.id], subtotal: p.precio * estado.lineas[p.id] };
      });
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

  function fijarCantidad(id, cantidad) {
    cantidad = Math.max(0, Math.min(MAX_CANTIDAD, cantidad));
    if (cantidad) estado.lineas[id] = cantidad;
    else delete estado.lineas[id];
    guardar();
    pintarCarrito();
  }

  function anadir(id, cantidad) {
    var plato = porId[id];
    fijarCantidad(id, (estado.lineas[id] || 0) + cantidad);
    anunciar("Añadido: " + cantidad + " × " + plato.nombre + ". Total del pedido: " + precio(resumen().total));
    animarBoton();
  }

  // ---------- Mensaje de WhatsApp ----------

  function mensajeWhatsApp() {
    var r = resumen();
    var texto = ["¡Hola, " + (cfg.nombre || "") + "! Quiero hacer un pedido:", ""];
    lineas().forEach(function (l) {
      texto.push("• " + l.cantidad + " × " + l.plato.nombre + " — " + precio(l.subtotal));
    });
    texto.push("", "Total orientativo: " + precio(r.total));
    texto.push("Modalidad: " + MODOS[estado.modo]);
    if (estado.nota.trim()) texto.push("Nota: " + estado.nota.trim());
    texto.push("", "¿Me confirmáis el total y cuándo estará listo? ¡Gracias!");
    // Intl usa espacios de no separación; se cambian por espacios normales para WhatsApp.
    return texto.join("\n").replace(/ /g, " ");
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
    abrir.append(crear("span", "visually-hidden", "Ver ficha de "), document.createTextNode(plato.nombre));
    abrir.addEventListener("click", function () {
      abrirFicha(plato);
    });

    var titulo = crear("h3");
    titulo.append(abrir);

    var cuerpo = crear("div", "menu-card-body");
    if (plato.etiquetas && plato.etiquetas.length) {
      var etiquetas = crear("ul", "menu-tags");
      plato.etiquetas.forEach(function (t) {
        etiquetas.append(crear("li", "", t));
      });
      cuerpo.append(etiquetas);
    }
    cuerpo.append(titulo, crear("p", "", plato.descripcion));

    var pie = crear("div", "menu-card-foot");
    var boton = crear("button", "btn btn-primary btn-small btn-add");
    boton.type = "button";
    boton.innerHTML = '<span aria-hidden="true">+</span> Añadir';
    boton.setAttribute("aria-label", "Añadir " + plato.nombre + " al pedido");
    boton.addEventListener("click", function () {
      anadir(plato.id, 1);
      confirmar(boton);
    });
    pie.append(crear("span", "price", precio(plato.precio)), boton);

    articulo.append(media(plato, false), cuerpo, pie);
    return articulo;
  }

  function confirmar(boton) {
    boton.classList.remove("is-added");
    void boton.offsetWidth;
    boton.classList.add("is-added");
    boton.innerHTML = '<span aria-hidden="true">✓</span> Añadido';
    clearTimeout(boton._t);
    boton._t = setTimeout(function () {
      boton.classList.remove("is-added");
      boton.innerHTML = '<span aria-hidden="true">+</span> Añadir';
    }, 1400);
  }

  function filtrar(categoria) {
    lista.querySelectorAll(".menu-card").forEach(function (t) {
      t.hidden = categoria !== "Todo" && t.dataset.categoria !== categoria;
    });
  }

  function pintarPestanas() {
    var nombres = ["Todo"].concat(carta.categorias);
    var botones = nombres.map(function (nombre, i) {
      var b = crear("button", "menu-tab", nombre);
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
      filtrar(b.textContent);
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

    seleccionar(botones[0], false);
  }

  // ---------- Ficha del plato ----------

  var fichaPlato = null;
  var fichaCantidad = 1;
  var foco = null;

  function pintarFicha() {
    $("[data-ficha-cantidad]", ficha).textContent = fichaCantidad;
    $("[data-ficha-menos]", ficha).disabled = fichaCantidad <= 1;
    $("[data-ficha-mas]", ficha).disabled = fichaCantidad >= MAX_CANTIDAD;
    $("[data-ficha-anadir]", ficha).textContent = "Añadir · " + precio(fichaPlato.precio * fichaCantidad);
  }

  function abrirFicha(plato) {
    fichaPlato = plato;
    fichaCantidad = 1;
    foco = document.activeElement;
    $("[data-ficha-media]", ficha).replaceChildren(media(plato, true));
    $("[data-ficha-cat]", ficha).textContent = plato.categoria;
    $("[data-ficha-nombre]", ficha).textContent = plato.nombre;
    $("[data-ficha-desc]", ficha).textContent = plato.descripcion;
    $("[data-ficha-precio]", ficha).textContent = precio(plato.precio);
    $("[data-ficha-alergenos]", ficha).textContent =
      plato.alergenos && plato.alergenos.length
        ? "Alérgenos: " + plato.alergenos.join(", ") + "."
        : "Consulta los alérgenos en el local.";
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
      anadir(fichaPlato.id, fichaCantidad);
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
    var etiquetaCuenta = r.cantidad + (r.cantidad === 1 ? " producto" : " productos");

    fab.hidden = vacio;
    $("[data-fab-cuenta]", fab).textContent = r.cantidad;
    $("[data-fab-total]", fab).textContent = precio(r.total);
    fab.setAttribute("aria-label", "Ver tu pedido: " + etiquetaCuenta + ", " + precio(r.total));

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
      info.append(crear("span", "cart-line-name", l.plato.nombre), crear("span", "cart-line-unit", precio(l.plato.precio) + " / ud."));

      var cantidad = crear("div", "qty qty--small");
      cantidad.setAttribute("role", "group");
      cantidad.setAttribute("aria-label", "Cantidad de " + l.plato.nombre);
      var menos = crear("button", "qty-btn", "−");
      menos.type = "button";
      menos.setAttribute("aria-label", "Quitar una unidad de " + l.plato.nombre);
      menos.addEventListener("click", function () {
        fijarCantidad(l.plato.id, l.cantidad - 1);
        devolverFoco(l.plato.id, "menos");
      });
      var mas = crear("button", "qty-btn", "+");
      mas.type = "button";
      mas.disabled = l.cantidad >= MAX_CANTIDAD;
      mas.setAttribute("aria-label", "Añadir una unidad de " + l.plato.nombre);
      mas.addEventListener("click", function () {
        fijarCantidad(l.plato.id, l.cantidad + 1);
        devolverFoco(l.plato.id, "mas");
      });
      menos.dataset.foco = l.plato.id + "-menos";
      mas.dataset.foco = l.plato.id + "-mas";
      cantidad.append(menos, crear("span", "qty-value", String(l.cantidad)), mas);

      var quitar = crear("button", "cart-line-remove", "Quitar");
      quitar.type = "button";
      quitar.setAttribute("aria-label", "Quitar " + l.plato.nombre + " del pedido");
      quitar.addEventListener("click", function () {
        fijarCantidad(l.plato.id, 0);
        anunciar(l.plato.nombre + " quitado del pedido");
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
      alternativa.hidden = false;
      if (!has(enlaces.instagram)) alternativa.textContent = "Pide en el local.";
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

  // ---------- Arranque ----------

  if (!lista || !pestanas || !ficha || !carrito || !fab || !has) return;

  carta.platos.forEach(function (p) {
    lista.append(tarjeta(p));
  });
  pintarPestanas();
  iniciarFicha();
  iniciarCarrito();

  // Sincroniza el carrito si se cambia en otra pestaña.
  window.addEventListener("storage", function (e) {
    if (e.key !== CLAVE_GUARDADO) return;
    estado = leer();
    $("#carrito-nota", carrito).value = estado.nota;
    pintarCarrito();
  });
})();
