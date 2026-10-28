(function () {
  "use strict";

  var cfg = window.CHIMIGO || {};

  var DIAS = [
    { clave: "lunes", nombre: "Lunes", schema: "Monday" },
    { clave: "martes", nombre: "Martes", schema: "Tuesday" },
    { clave: "miercoles", nombre: "Miércoles", schema: "Wednesday" },
    { clave: "jueves", nombre: "Jueves", schema: "Thursday" },
    { clave: "viernes", nombre: "Viernes", schema: "Friday" },
    { clave: "sabado", nombre: "Sábado", schema: "Saturday" },
    { clave: "domingo", nombre: "Domingo", schema: "Sunday" },
  ];

  var PLATAFORMAS = [
    { clave: "uberEats", nombre: "Uber Eats" },
    { clave: "glovo", nombre: "Glovo" },
    { clave: "justEat", nombre: "Just Eat" },
  ];

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

  function direccionCompleta() {
    var d = cfg.direccion || {};
    return [d.calle, [d.codigoPostal, d.ciudad].filter(has).join(" ")].filter(has).join(", ");
  }

  function destinoMapa() {
    var c = cfg.coordenadas || {};
    if (has(c.lat) && has(c.lng)) return c.lat + "," + c.lng;
    return (cfg.nombre ? cfg.nombre + ", " : "") + direccionCompleta();
  }

  var enlaces = {
    llegar: "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(destinoMapa()),
    mapa: "https://www.google.com/maps?q=" + encodeURIComponent(destinoMapa()) + "&output=embed",
    telefono: has(cfg.contacto && cfg.contacto.telefono) ? "tel:" + digitos(cfg.contacto.telefono) : "",
    whatsapp: has(cfg.contacto && cfg.contacto.whatsapp)
      ? "https://wa.me/" + digitos(cfg.contacto.whatsapp).replace("+", "")
      : "",
    email: has(cfg.contacto && cfg.contacto.email) ? "mailto:" + cfg.contacto.email : "",
    instagram: has(cfg.redes && cfg.redes.instagram) ? cfg.redes.instagram : "",
    reservas: has(cfg.reservas) ? cfg.reservas : "",
  };

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
    reservas: has(enlaces.reservas),
    terraza: cfg.terraza === true,
  };

  // ---------- Horario ----------

  function franjasTexto(franjas) {
    return franjas
      .map(function (f) {
        return f[0] + " – " + f[1];
      })
      .join(" y ");
  }

  // Agrupa días consecutivos con el mismo horario: "Martes a domingo: 13:00 – 23:30".
  function gruposHorario() {
    var horario = cfg.horario || {};
    var grupos = [];
    DIAS.forEach(function (dia) {
      var franjas = horario[dia.clave] || [];
      var clave = JSON.stringify(franjas);
      var ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.clave === clave) {
        ultimo.hasta = dia;
      } else {
        grupos.push({ clave: clave, desde: dia, hasta: dia, franjas: franjas });
      }
    });
    return grupos.map(function (g) {
      var dias = g.desde === g.hasta ? g.desde.nombre : g.desde.nombre + " a " + g.hasta.nombre.toLowerCase();
      return { dias: dias, horas: g.franjas.length ? franjasTexto(g.franjas) : "Cerrado" };
    });
  }

  function pintarHorario() {
    var grupos = gruposHorario();
    var abiertos = grupos.filter(function (g) {
      return g.horas !== "Cerrado";
    });

    document.querySelectorAll("[data-horario-lista]").forEach(function (lista) {
      lista.textContent = "";
      grupos.forEach(function (g) {
        var dt = document.createElement("dt");
        var dd = document.createElement("dd");
        dt.textContent = g.dias;
        dd.textContent = g.horas;
        lista.append(dt, dd);
      });
    });

    document.querySelectorAll("[data-horario-corto]").forEach(function (el) {
      if (!abiertos.length) {
        el.closest("li").hidden = true;
        return;
      }
      el.textContent = abiertos
        .map(function (g) {
          return g.dias + ", " + g.horas;
        })
        .join(" · ");
    });
  }

  // ---------- Pintar datos ----------

  function pintarDatos() {
    var metro = cfg.metro || {};
    var textos = {
      nombre: cfg.nombre,
      direccion: [cfg.direccion && cfg.direccion.calle, cfg.direccion && cfg.direccion.barrio, cfg.direccion && cfg.direccion.ciudad]
        .filter(has)
        .join(" · "),
      metro: has(metro.estacion)
        ? metro.estacion + (has(metro.lineas) ? " (" + metro.lineas.join(", ") + ")" : "")
        : "",
      "metro-corto": has(metro.estacion) ? "Metro " + metro.estacion : "",
      telefono: cfg.contacto && cfg.contacto.telefono,
      email: cfg.contacto && cfg.contacto.email,
    };

    document.querySelectorAll("[data-cfg]").forEach(function (el) {
      var valor = textos[el.getAttribute("data-cfg")];
      var contenedor = el.closest("[data-cfg-contenedor]") || el;
      if (has(valor)) el.textContent = valor;
      contenedor.hidden = !has(valor);
    });

    document.querySelectorAll("[data-href]").forEach(function (el) {
      var url = enlaces[el.getAttribute("data-href")];
      if (has(url)) el.setAttribute("href", url);
    });

    document.querySelectorAll("[data-requiere]").forEach(function (el) {
      var requisitos = el.getAttribute("data-requiere").split(" ");
      el.hidden = !requisitos.every(function (r) {
        return disponibles[r];
      });
    });

    var mapa = document.querySelector("[data-mapa]");
    if (mapa) mapa.src = enlaces.mapa;

    var listaDelivery = document.querySelector("[data-delivery]");
    if (listaDelivery) {
      delivery.forEach(function (p) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.className = "btn btn-primary";
        a.href = cfg.pedidos[p.clave];
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = p.nombre;
        li.append(a);
        listaDelivery.append(li);
      });
    }

    pintarHorario();

    if (document.querySelector(".mobile-bar:not([hidden])")) {
      document.body.classList.add("has-mobile-bar");
    }
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
      boton.setAttribute("aria-label", "Cerrar menú");
      var primero = nav.querySelector("a");
      if (primero) primero.focus();
    }

    function cerrar(devolverFoco) {
      header.classList.remove("nav-open");
      boton.setAttribute("aria-expanded", "false");
      boton.setAttribute("aria-label", "Abrir menú");
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

    window.matchMedia("(min-width: 861px)").addEventListener("change", function (e) {
      if (e.matches) cerrar(false);
    });
  }

  // ---------- Foto de portada ----------

  // Si existe img/hero.jpg se usa como fondo; si no, se queda el degradado.
  function iniciarFotoPortada() {
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var foto = new Image();
    foto.onload = function () {
      hero.classList.add("hero--foto");
    };
    foto.src = "img/hero.jpg";
  }

  // ---------- Datos estructurados ----------

  function datosEstructurados() {
    var d = cfg.direccion || {};
    var c = cfg.coordenadas || {};
    var horario = cfg.horario || {};

    var datos = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: cfg.nombre,
      description: cfg.descripcion,
      servesCuisine: cfg.tipoCocina,
      address: {
        "@type": "PostalAddress",
        streetAddress: d.calle,
        addressLocality: d.ciudad,
        addressCountry: d.pais,
      },
    };

    if (has(d.codigoPostal)) datos.address.postalCode = d.codigoPostal;
    if (has(cfg.web)) {
      datos.url = cfg.web;
      datos.menu = cfg.web + "#menu";
    }
    if (has(c.lat) && has(c.lng)) {
      datos.geo = { "@type": "GeoCoordinates", latitude: c.lat, longitude: c.lng };
    }
    if (has(cfg.contacto && cfg.contacto.telefono)) datos.telephone = cfg.contacto.telefono;
    if (has(cfg.contacto && cfg.contacto.email)) datos.email = cfg.contacto.email;
    if (disponibles.instagram) datos.sameAs = [enlaces.instagram];
    if (disponibles.reservas) datos.acceptsReservations = enlaces.reservas;

    var porFranja = {};
    DIAS.forEach(function (dia) {
      (horario[dia.clave] || []).forEach(function (f) {
        var clave = f[0] + "-" + f[1];
        (porFranja[clave] = porFranja[clave] || { opens: f[0], closes: f[1], dias: [] }).dias.push(dia.schema);
      });
    });
    var especificacion = Object.keys(porFranja).map(function (k) {
      var f = porFranja[k];
      return { "@type": "OpeningHoursSpecification", dayOfWeek: f.dias, opens: f.opens, closes: f.closes };
    });
    if (especificacion.length) datos.openingHoursSpecification = especificacion;

    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(datos);
    document.head.append(script);
  }

  // ---------- Arranque ----------

  // Compartido con js/carta.js
  window.ChimiGo = { has: has, enlaces: enlaces };

  pintarDatos();
  iniciarMenu();
  iniciarFotoPortada();
  datosEstructurados();

  document.querySelectorAll("[data-anio]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
