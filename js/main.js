(function () {
  "use strict";

  var cfg = window.CHIMIGO || {};
  var carta = window.CHIMIGO_MENU || { categorias: [], platos: [], extras: [] };
  var i18n = window.ChimiGoI18n;
  var t = i18n.t;

  var DIAS = [
    { clave: "lunes", schema: "Monday" },
    { clave: "martes", schema: "Tuesday" },
    { clave: "miercoles", schema: "Wednesday" },
    { clave: "jueves", schema: "Thursday" },
    { clave: "viernes", schema: "Friday" },
    { clave: "sabado", schema: "Saturday" },
    { clave: "domingo", schema: "Sunday" },
  ];

  // Colores y logotipo sencillo de cada plataforma de reparto.
  var PLATAFORMAS = [
    {
      clave: "glovo",
      nombre: "Glovo",
      clase: "delivery-card--glovo",
      logo: '<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true"><circle cx="24" cy="24" r="24" fill="#00a082"/><circle cx="24" cy="20" r="8" fill="none" stroke="#ffc244" stroke-width="4"/><path d="M24 28v9" stroke="#ffc244" stroke-width="4" stroke-linecap="round"/></svg>',
    },
    {
      clave: "uberEats",
      nombre: "Uber Eats",
      clase: "delivery-card--ubereats",
      logo: '<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true"><rect width="48" height="48" rx="12" fill="#06c167"/><text x="24" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#000">Eats</text></svg>',
    },
    {
      clave: "justEat",
      nombre: "Just Eat",
      clase: "delivery-card--justeat",
      logo: '<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true"><circle cx="24" cy="24" r="24" fill="#fff"/><path d="M12 25 24 14l12 11v10a1 1 0 0 1-1 1H13a1 1 0 0 1-1-1Z" fill="#ff8000"/><path d="M20 36v-7h8v7" fill="#fff"/></svg>',
    },
  ];

  var ICONOS = {
    bolsa: '<svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7Z M9 7a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    mesa: '<svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true"><path d="M4 10h16M6 10v9M18 10v9M8 6h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  };

  // ---------- Utilidades ----------

  function has(valor) {
    if (valor === null || valor === undefined) return false;
    if (Array.isArray(valor)) return valor.length > 0;
    var texto = String(valor).trim();
    return texto !== "" && texto.toUpperCase() !== "PENDIENTE";
  }

  function digitos(telefono) {
    return String(telefono).replace(/[^\d+]/g, "");
  }

  function crear(etiqueta, clase, texto) {
    var el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  function direccionCompleta() {
    var d = cfg.direccion || {};
    return [d.calle, [d.codigoPostal, d.ciudad].filter(has).join(" ")].filter(has).join(", ");
  }

  function destinoMapa() {
    var c = cfg.coordenadas || {};
    if (has(c.lat) && has(c.lng)) return c.lat + "," + c.lng;
    return (cfg.nombre ? cfg.nombre + ", " : "") + direccionCompleta();
  }

  function telefonoLocal() {
    return has(cfg.contacto && cfg.contacto.telefono) ? cfg.contacto.telefono.replace(/^\+34\s*/, "") : "";
  }

  // "a, b y c" / "a, b and c"
  function listaTexto(elementos) {
    if (elementos.length < 2) return elementos.join("");
    return elementos.slice(0, -1).join(", ") + t("horario.y") + elementos[elementos.length - 1];
  }

  var enlaces = {
    llegar: "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(destinoMapa()),
    mapa: "https://www.google.com/maps?q=" + encodeURIComponent(destinoMapa()) + "&output=embed",
    opiniones: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(destinoMapa()),
    telefono: has(cfg.contacto && cfg.contacto.telefono) ? "tel:" + digitos(cfg.contacto.telefono) : "",
    whatsapp: has(cfg.contacto && cfg.contacto.whatsapp)
      ? "https://wa.me/" + digitos(cfg.contacto.whatsapp).replace("+", "")
      : "",
    email: has(cfg.contacto && cfg.contacto.email) ? "mailto:" + cfg.contacto.email : "",
    instagram: has(cfg.redes && cfg.redes.instagram) ? cfg.redes.instagram : "",
    tiktok: has(cfg.redes && cfg.redes.tiktok) ? cfg.redes.tiktok : "",
    reservas: "",
  };

  if (has(cfg.reservas)) enlaces.reservas = cfg.reservas;
  else if (cfg.reservasPorTelefono && has(enlaces.telefono)) enlaces.reservas = enlaces.telefono;

  var delivery = PLATAFORMAS.filter(function (p) {
    return has(cfg.pedidos && cfg.pedidos[p.clave]);
  });

  // Hay forma de pedir si existe alguna plataforma, WhatsApp o teléfono.
  var puedePedir = delivery.length > 0 || has(enlaces.whatsapp) || has(enlaces.telefono);

  var disponibles = {
    pedir: puedePedir,
    pedidos: puedePedir || has(enlaces.reservas),
    llegar: has(direccionCompleta()) || has(cfg.coordenadas && cfg.coordenadas.lat),
    telefono: has(enlaces.telefono),
    whatsapp: has(enlaces.whatsapp),
    email: has(enlaces.email),
    instagram: has(enlaces.instagram),
    tiktok: has(enlaces.tiktok),
    eventos: cfg.eventosPrivados === true,
    reservas: has(enlaces.reservas),
    terraza: cfg.terraza === true,
  };

  // ---------- Horario ----------

  function franjasDe(indice) {
    return (cfg.horario || {})[DIAS[indice].clave] || [];
  }

  function aMinutos(hora) {
    var p = hora.split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function franjasTexto(franjas) {
    if (!franjas.length) return t("horario.cerrado");
    return listaTexto(
      franjas.map(function (f) {
        return f[0] + " – " + f[1];
      })
    );
  }

  // Día de la semana (0 = lunes) y minutos desde medianoche en Madrid, sea cual sea la zona del visitante.
  function ahoraMadrid() {
    var partes = {};
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .forEach(function (p) {
        partes[p.type] = p.value;
      });
    return {
      dia: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(partes.weekday),
      minutos: parseInt(partes.hour, 10) * 60 + parseInt(partes.minute, 10),
    };
  }

  // Una franja cuyo cierre es anterior a su apertura (p. ej. 20:00–02:00) termina al día siguiente.
  function estadoHorario() {
    var ahora = ahoraMadrid();
    var i;
    var hoy = franjasDe(ahora.dia);
    for (i = 0; i < hoy.length; i++) {
      var inicio = aMinutos(hoy[i][0]);
      var fin = aMinutos(hoy[i][1]);
      if (fin <= inicio) fin += 1440;
      if (ahora.minutos >= inicio && ahora.minutos < fin) return { abierto: true, cierra: hoy[i][1] };
    }
    var ayer = franjasDe((ahora.dia + 6) % 7);
    for (i = 0; i < ayer.length; i++) {
      if (aMinutos(ayer[i][1]) <= aMinutos(ayer[i][0]) && ahora.minutos < aMinutos(ayer[i][1])) {
        return { abierto: true, cierra: ayer[i][1] };
      }
    }
    for (var d = 0; d <= 7; d++) {
      var indice = (ahora.dia + d) % 7;
      var aperturas = franjasDe(indice)
        .map(function (f) {
          return f[0];
        })
        .filter(function (h) {
          return d > 0 || aMinutos(h) > ahora.minutos;
        })
        .sort();
      if (aperturas.length) return { abierto: false, enDias: d, dia: indice, abre: aperturas[0] };
    }
    return null;
  }

  // Agrupa días consecutivos con el mismo horario: "Martes a domingo".
  function gruposHorario() {
    var grupos = [];
    DIAS.forEach(function (dia, i) {
      var franjas = franjasDe(i);
      var clave = JSON.stringify(franjas);
      var ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.clave === clave) ultimo.hasta = i;
      else grupos.push({ clave: clave, desde: i, hasta: i, franjas: franjas });
    });
    var nombres = t("dias");
    return grupos.map(function (g) {
      var hasta = i18n.idioma() === "es" ? nombres[g.hasta].toLowerCase() : nombres[g.hasta];
      return {
        dias: g.desde === g.hasta ? nombres[g.desde] : t("horario.rango", { desde: nombres[g.desde], hasta: hasta }),
        horas: franjasTexto(g.franjas),
        abierto: g.franjas.length > 0,
      };
    });
  }

  function pintarEstado() {
    var estado = estadoHorario();
    var nombres = t("dias");
    document.querySelectorAll("[data-estado-horario]").forEach(function (el) {
      el.hidden = !estado;
      if (!estado) return;
      var texto;
      if (estado.abierto) texto = t("estado.abierto", { hora: estado.cierra });
      else if (estado.enDias === 0) texto = t("estado.abreHoy", { hora: estado.abre });
      else if (estado.enDias === 1) texto = t("estado.abreManana", { hora: estado.abre });
      else {
        var dia = i18n.idioma() === "es" ? nombres[estado.dia].toLowerCase() : nombres[estado.dia];
        texto = t("estado.abreDia", { dia: dia, hora: estado.abre });
      }
      el.classList.toggle("is-open", estado.abierto);
      el.classList.toggle("is-closed", !estado.abierto);
      var punto = crear("span", "open-status-dot");
      punto.setAttribute("aria-hidden", "true");
      el.replaceChildren(punto, document.createTextNode(texto));
    });

    var hoy = ahoraMadrid().dia;
    document.querySelectorAll("[data-horario-tabla] tbody tr").forEach(function (fila, i) {
      var esHoy = i === hoy;
      fila.classList.toggle("is-today", esHoy);
      if (esHoy) fila.setAttribute("aria-current", "date");
      else fila.removeAttribute("aria-current");
      var marca = fila.querySelector(".schedule-today");
      if (marca) marca.hidden = !esHoy;
    });
  }

  function pintarHorario() {
    var nombres = t("dias");
    document.querySelectorAll("[data-horario-tabla] tbody").forEach(function (cuerpo) {
      cuerpo.replaceChildren();
      DIAS.forEach(function (dia, i) {
        var fila = crear("tr");
        var th = crear("th", "", nombres[i]);
        th.scope = "row";
        var hoy = crear("span", "schedule-today", t("horario.hoy"));
        hoy.hidden = true;
        th.append(" ", hoy);
        fila.append(th, crear("td", "", franjasTexto(franjasDe(i))));
        cuerpo.append(fila);
      });
    });

    var abiertos = gruposHorario().filter(function (g) {
      return g.abierto;
    });
    document.querySelectorAll("[data-horario-corto]").forEach(function (el) {
      el.closest("li").hidden = !abiertos.length;
      el.textContent = abiertos
        .map(function (g) {
          return t("horario.corto", { dias: g.dias, horas: g.horas });
        })
        .join(" · ");
    });

    pintarEstado();
  }

  // ---------- Pedidos y reservas ----------

  function tarjetaPedido(opciones) {
    var li = crear("li");
    var a = crear("a", "delivery-card " + (opciones.clase || ""));
    a.href = opciones.href;
    if (opciones.externo) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    var icono = crear("span", "delivery-logo");
    icono.innerHTML = opciones.icono;
    var cuerpo = crear("span", "delivery-body");
    cuerpo.append(crear("span", "delivery-title", opciones.titulo), crear("span", "delivery-text", opciones.texto));
    var accion = crear("span", "delivery-cta", opciones.accion);
    var flecha = crear("span", "", " →");
    flecha.setAttribute("aria-hidden", "true");
    accion.append(flecha);
    if (opciones.externo) accion.append(crear("span", "visually-hidden", " " + t("comun.ventanaNueva")));
    a.append(icono, cuerpo, accion);
    li.append(a);
    return li;
  }

  function pintarPedidos() {
    var lista = document.querySelector("[data-pedidos]");
    if (!lista) return;
    lista.replaceChildren();

    if (disponibles.telefono) {
      lista.append(
        tarjetaPedido({
          clase: "delivery-card--recoger",
          href: enlaces.telefono,
          icono: ICONOS.bolsa,
          titulo: t("pedidos.recoger.titulo"),
          texto: t("pedidos.recoger.texto"),
          accion: t("pedidos.recoger.accion") + " · " + telefonoLocal(),
        })
      );
    }
    if (disponibles.whatsapp) {
      lista.append(
        tarjetaPedido({
          clase: "delivery-card--whatsapp",
          href: enlaces.whatsapp,
          externo: true,
          icono: ICONOS.whatsapp,
          titulo: "WhatsApp",
          texto: t("pedidos.whatsapp.texto"),
          accion: t("pedidos.whatsapp.accion"),
        })
      );
    }
    delivery.forEach(function (p) {
      lista.append(
        tarjetaPedido({
          clase: p.clase,
          href: cfg.pedidos[p.clave],
          externo: true,
          icono: p.logo,
          titulo: p.nombre,
          texto: t("pedidos.plataforma.texto", { nombre: p.nombre }),
          accion: t("pedidos.plataforma.accion", { nombre: p.nombre }),
        })
      );
    });
    if (disponibles.reservas) {
      var porTelefono = enlaces.reservas === enlaces.telefono;
      lista.append(
        tarjetaPedido({
          clase: "delivery-card--reservas",
          href: enlaces.reservas,
          externo: !porTelefono,
          icono: ICONOS.mesa,
          titulo: t("pedidos.reservas.titulo"),
          texto: t(porTelefono ? "pedidos.reservas.telefono" : "pedidos.reservas.web"),
          accion: t("pedidos.reservas.accion"),
        })
      );
    }
  }

  // ---------- Opiniones ----------

  function pintarOpiniones() {
    var el = document.querySelector("[data-valoracion]");
    var v = cfg.valoracion || {};
    if (!el) return;
    el.hidden = !has(v.media);
    if (el.hidden) return;
    var formato = new Intl.NumberFormat(i18n.idioma() === "es" ? "es-ES" : "en-GB", { maximumFractionDigits: 1 });
    var estrellas = crear("span", "reviews-stars", "★★★★★");
    estrellas.style.setProperty("--valor", Math.max(0, Math.min(5, v.media)) / 5);
    estrellas.setAttribute("aria-hidden", "true");
    el.replaceChildren(estrellas, crear("strong", "", t("opiniones.valoracion", { media: formato.format(v.media) })));
    if (has(v.numeroOpiniones)) el.append(" " + t("opiniones.numero", { numero: formato.format(v.numeroOpiniones) }));
  }

  // ---------- Preguntas frecuentes ----------

  function preguntas() {
    var d = cfg.direccion || {};
    var metro = cfg.metro || {};
    var lista = [];

    var donde = t("faq.donde.r", { calle: d.calle, barrio: d.barrio, lugar: [d.codigoPostal, d.ciudad].filter(has).join(" ") });
    if (has(metro.estacion)) {
      donde += t("faq.donde.metro", { estacion: metro.estacion, lineas: listaTexto(metro.lineas || []) });
    }
    lista.push([t("faq.donde.p"), donde]);

    var horario = gruposHorario()
      .map(function (g) {
        return g.dias + ": " + g.horas;
      })
      .join(". ");
    lista.push([t("faq.horario.p"), horario + "."]);

    if (disponibles.terraza) lista.push([t("faq.terraza.p"), t("faq.terraza.r")]);

    if (disponibles.reservas || disponibles.eventos) {
      var reservas = "";
      if (disponibles.reservas) {
        reservas = has(cfg.reservas) ? t("faq.reservas.web") : t("faq.reservas.telefono", { telefono: telefonoLocal() });
      }
      if (disponibles.eventos) reservas += t("faq.reservas.eventos");
      lista.push([t("faq.reservas.p"), reservas.trim()]);
    }

    if (delivery.length || disponibles.telefono) {
      var domicilio = "";
      if (delivery.length) {
        domicilio = t("faq.domicilio.plataformas", {
          plataformas: listaTexto(
            delivery.map(function (p) {
              return p.nombre;
            })
          ),
        });
        if (disponibles.telefono) domicilio += t("faq.domicilio.recoger", { telefono: telefonoLocal() });
      } else {
        domicilio = t("faq.domicilio.soloRecoger", { telefono: telefonoLocal() });
      }
      lista.push([t("faq.domicilio.p"), domicilio]);
    }

    lista.push([t("faq.alergenos.p"), t("faq.alergenos.r")]);
    return lista;
  }

  function pintarFaq() {
    var contenedor = document.querySelector("[data-faq]");
    if (!contenedor) return;
    var abiertas = [];
    contenedor.querySelectorAll("details").forEach(function (d, i) {
      if (d.open) abiertas.push(i);
    });
    contenedor.replaceChildren();
    preguntas().forEach(function (p, i) {
      var detalle = crear("details", "faq-item");
      detalle.open = abiertas.indexOf(i) !== -1;
      detalle.append(crear("summary", "", p[0]), crear("p", "", p[1]));
      contenedor.append(detalle);
    });
  }

  // ---------- Contacto ----------

  function iniciarContacto() {
    var form = document.querySelector("[data-contacto]");
    if (!form || !disponibles.email) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var cuerpo = t("contacto.cuerpo", {
        nombre: form.nombre.value.trim(),
        email: form.email.value.trim(),
        mensaje: form.mensaje.value.trim(),
      });
      window.location.href =
        enlaces.email + "?subject=" + encodeURIComponent(t("contacto.asunto")) + "&body=" + encodeURIComponent(cuerpo);
    });
  }

  // ---------- Pintar datos ----------

  // Todo lo que depende del idioma; se repinta al cambiarlo.
  function pintarTextos() {
    var metro = cfg.metro || {};
    var el = document.querySelector('[data-cfg="metro-corto"]');
    if (el && has(metro.estacion)) el.textContent = t("metro.corto", { estacion: metro.estacion });

    var boton = document.querySelector(".nav-toggle");
    if (boton) boton.setAttribute("aria-label", t(boton.getAttribute("aria-expanded") === "true" ? "nav.cerrar" : "nav.abrir"));

    pintarHorario();
    pintarPedidos();
    pintarOpiniones();
    pintarFaq();
  }

  function pintarDatos() {
    var metro = cfg.metro || {};
    var textos = {
      nombre: cfg.nombre,
      lema: cfg.lema,
      direccion: [cfg.direccion && cfg.direccion.calle, cfg.direccion && cfg.direccion.barrio, cfg.direccion && cfg.direccion.ciudad]
        .filter(has)
        .join(" · "),
      metro: has(metro.estacion)
        ? metro.estacion + (has(metro.lineas) ? " (" + metro.lineas.join(", ") + ")" : "")
        : "",
      "metro-corto": metro.estacion,
      telefono: cfg.contacto && cfg.contacto.telefono,
      email: cfg.contacto && cfg.contacto.email,
    };

    document.querySelectorAll("[data-cfg]").forEach(function (el) {
      var valor = textos[el.getAttribute("data-cfg")];
      var contenedor = el.closest("[data-cfg-contenedor]") || el;
      if (has(valor)) el.textContent = valor;
      contenedor.hidden = !has(valor);
    });

    // Un enlace sin dato se quita de la página (oculto no basta: los buscadores lo ven como enlace roto).
    document.querySelectorAll("[data-href]").forEach(function (el) {
      var url = enlaces[el.getAttribute("data-href")];
      if (has(url)) el.setAttribute("href", url);
      else el.remove();
    });

    document.querySelectorAll("[data-requiere]").forEach(function (el) {
      var requisitos = el.getAttribute("data-requiere").split(" ");
      el.hidden = !requisitos.every(function (r) {
        return disponibles[r];
      });
    });

    var mapa = document.querySelector("[data-mapa]");
    if (mapa) mapa.src = enlaces.mapa;

    pintarTextos();

    if (document.querySelector(".mobile-bar:not([hidden])")) {
      document.body.classList.add("has-mobile-bar");
    }

    document.documentElement.classList.add("datos-listos");
  }

  // ---------- Menú móvil ----------

  function iniciarMenu() {
    var header = document.querySelector(".site-header");
    var boton = document.querySelector(".nav-toggle");
    var nav = document.getElementById("menu-principal");
    if (!header || !boton || !nav) return;

    function abrir() {
      header.classList.add("nav-open");
      boton.setAttribute("aria-expanded", "true");
      boton.setAttribute("aria-label", t("nav.cerrar"));
      var primero = nav.querySelector("a");
      if (primero) primero.focus();
    }

    function cerrar(devolverFoco) {
      header.classList.remove("nav-open");
      boton.setAttribute("aria-expanded", "false");
      boton.setAttribute("aria-label", t("nav.abrir"));
      if (devolverFoco) boton.focus();
    }

    function abierto() {
      return boton.getAttribute("aria-expanded") === "true";
    }

    boton.addEventListener("click", function () {
      abierto() ? cerrar(false) : abrir();
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) cerrar(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && abierto()) cerrar(true);
    });

    document.addEventListener("click", function (e) {
      if (abierto() && !header.contains(e.target)) cerrar(false);
    });

    window.matchMedia("(min-width: 1101px)").addEventListener("change", function (e) {
      if (e.matches) cerrar(false);
    });
  }

  // ---------- Datos estructurados ----------

  function oferta(precio) {
    return { "@type": "Offer", price: precio.toFixed(2), priceCurrency: "EUR" };
  }

  function menuSchema() {
    var secciones = carta.categorias
      .map(function (categoria) {
        return {
          "@type": "MenuSection",
          name: categoria,
          hasMenuItem: carta.platos
            .filter(function (p) {
              return p.categoria === categoria;
            })
            .map(function (p) {
              var item = { "@type": "MenuItem", name: p.nombre, offers: oferta(p.precio) };
              if (p.descripcion) item.description = p.descripcion;
              return item;
            }),
        };
      })
      .filter(function (s) {
        return s.hasMenuItem.length;
      });

    if (carta.extras && carta.extras.length) {
      secciones.push({
        "@type": "MenuSection",
        name: "Extras",
        hasMenuItem: carta.extras.map(function (e) {
          return { "@type": "MenuItem", name: e.nombre, offers: oferta(e.precio) };
        }),
      });
    }

    var menu = { "@type": "Menu", name: "Carta", inLanguage: "es", hasMenuSection: secciones };
    if (has(cfg.web)) menu.url = cfg.web + "#menu";
    return menu;
  }

  function datosEstructurados() {
    var d = cfg.direccion || {};
    var c = cfg.coordenadas || {};

    var datos = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: cfg.nombre,
      description: cfg.descripcion,
      slogan: cfg.lema,
      servesCuisine: cfg.tipoCocina,
      address: {
        "@type": "PostalAddress",
        streetAddress: d.calle,
        addressLocality: d.ciudad,
        addressCountry: d.pais,
      },
      acceptsReservations: disponibles.reservas ? (has(cfg.reservas) ? cfg.reservas : true) : false,
    };

    if (has(d.codigoPostal)) datos.address.postalCode = d.codigoPostal;
    if (has(cfg.web)) {
      datos.url = cfg.web;
      datos.image = cfg.web + "img/og.jpg";
    }
    if (has(c.lat) && has(c.lng)) {
      datos.geo = { "@type": "GeoCoordinates", latitude: c.lat, longitude: c.lng };
    }
    if (has(cfg.contacto && cfg.contacto.telefono)) datos.telephone = cfg.contacto.telefono;
    if (has(cfg.contacto && cfg.contacto.email)) datos.email = cfg.contacto.email;
    if (disponibles.instagram) datos.sameAs = [enlaces.instagram];

    var porFranja = {};
    DIAS.forEach(function (dia, i) {
      franjasDe(i).forEach(function (f) {
        var clave = f[0] + "-" + f[1];
        (porFranja[clave] = porFranja[clave] || { opens: f[0], closes: f[1], dias: [] }).dias.push(dia.schema);
      });
    });
    var especificacion = Object.keys(porFranja).map(function (k) {
      var f = porFranja[k];
      return { "@type": "OpeningHoursSpecification", dayOfWeek: f.dias, opens: f.opens, closes: f.closes };
    });
    if (especificacion.length) datos.openingHoursSpecification = especificacion;

    if (carta.platos.length) datos.hasMenu = menuSchema();

    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(datos);
    document.head.append(script);
  }

  // ---------- Sin conexión ----------

  // El service worker es una mejora: si el navegador no lo admite o falla, la web funciona igual.
  function registrarServiceWorker() {
    var local = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    if (!("serviceWorker" in navigator) || (location.protocol !== "https:" && !local)) return;
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  // ---------- Arranque ----------

  // Compartido con js/carta.js y js/galeria.js
  window.ChimiGo = { has: has, enlaces: enlaces, crear: crear };

  pintarDatos();
  iniciarMenu();
  iniciarContacto();
  datosEstructurados();
  registrarServiceWorker();

  setInterval(pintarEstado, 60000);
  document.addEventListener("chimigo:idioma", pintarTextos);

  document.querySelectorAll("[data-anio]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
