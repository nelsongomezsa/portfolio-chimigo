/*
 * Idiomas de la interfaz (ES / EN).
 * - Los textos fijos en español están en index.html, marcados con data-i18n="clave"
 *   (y data-i18n-attr="atributo:clave;otro:clave" para atributos). Aquí solo va su versión en inglés.
 * - Los textos que genera el JavaScript tienen las dos versiones en TEXTOS.
 * - Los nombres de los platos no se traducen (están en js/menu.js); las descripciones sí.
 */
(function () {
  "use strict";

  var CLAVE_GUARDADO = "chimigo-idioma";
  var IDIOMAS = ["es", "en"];

  // Versión en inglés de los textos fijos de index.html.
  var FIJOS_EN = {
    skip: "Skip to content",
    "logo.label": "ChimiGO Urban Food, go to the top",
    "nav.label": "Main",
    "nav.nosotros": "About",
    "nav.menu": "Menu",
    "nav.ambiente": "Vibe",
    "nav.eventos": "Events",
    "nav.ubicacion": "Location",
    "nav.preguntas": "FAQ",
    "nav.contacto": "Contact",
    "accion.pedir": "Order",
    "accion.verMenu": "See the menu",
    "accion.llegar": "Directions",
    "accion.llamar": "Call",
    "accion.instagram": "Message us on Instagram",
    "hero.titulo": "Authentic Dominican chimi in the heart of Cuatro Caminos",
    "hero.lead": "Street flavour, timeless recipe. Find out why we're Madrid's favourite little Dominican spot.",
    "hero.terraza": "Outdoor terrace",
    "nosotros.titulo": "About us",
    "nosotros.p1":
      "The chimi was born on the streets of the Dominican Republic, inspired by the Argentinian choripán, and over time became the country's best-loved street sandwich. At ChimiGO we make it just like back home: toasted bread, well-seasoned grilled meat, fresh cabbage salad and our house sauces.",
    "nosotros.p2":
      "We're one of the first chimi specialists in Madrid and a meeting point for the Dominican community in Cuatro Caminos. Terrace, family atmosphere and lots of flavour: that's ChimiGO.",
    "menu.titulo": "Our menu",
    "menu.categorias": "Menu categories",
    "menu.nota": "Prices are approximate. Ask at the restaurant for the menu and allergens.",
    "pedir.titulo": "Orders and bookings",
    "pedir.lead": "Take it away, get it delivered or book a table.",
    "ambiente.lead": "A taste of what's waiting for you at the table.",
    "eventos.titulo": "Private events",
    "eventos.texto":
      "A birthday, a get-together or the match with your crew? Hold your private event at ChimiGO. Call us or message us on Instagram and we'll plan it with you.",
    "opiniones.titulo": "Reviews",
    "opiniones.texto": "Been here before? Read what our customers say on Google or leave your own review.",
    "opiniones.boton": "See reviews on Google",
    "ubicacion.titulo": "Find us",
    "ubicacion.direccion": "Address:",
    "ubicacion.metro": "Metro:",
    "ubicacion.horario": "Opening hours",
    "ubicacion.horarioCaption": "Opening hours by day",
    "ubicacion.terraza": "We have an outdoor terrace to enjoy your chimi in the open air.",
    "ubicacion.mapa": "Map showing ChimiGO Urban Food in Cuatro Caminos, Madrid",
    "faq.titulo": "Frequently asked questions",
    "contacto.titulo": "Contact",
    "contacto.lead": "Questions, large orders or events? Get in touch.",
    "contacto.nombre": "Name",
    "contacto.email": "Email",
    "contacto.mensaje": "Message",
    "contacto.aviso": "Your email app will open with the message ready to send.",
    "contacto.enviar": "Prepare email",
    "pie.derechos": "All rights reserved.",
    "ficha.cerrar": "Close details",
    "ficha.extras": "Add extras",
    "comun.opcional": "(optional)",
    "ficha.cantidad": "Quantity",
    "ficha.menos": "One less",
    "ficha.mas": "One more",
    "galeria.cerrar": "Close gallery",
    "galeria.anterior": "Previous photo",
    "galeria.siguiente": "Next photo",
    "carrito.titulo": "Your order",
    "carrito.cerrar": "Close order",
    "carrito.vacio": "You haven't added anything yet.",
    "carrito.modo": "How would you like it?",
    "carrito.recoger": "To take away",
    "carrito.local": "To eat in",
    "carrito.nota": "Note for the restaurant",
    "carrito.notaEjemplo": "No onion, sauce on the side…",
    "carrito.total": "Total",
    "carrito.aviso": "The total is approximate: the restaurant will confirm the final price.",
    "carrito.whatsapp": "Order on WhatsApp",
    "barra.label": "Quick actions",
  };

  // Textos generados desde el JavaScript. {variable} se sustituye al usarlos.
  var TEXTOS = {
    es: {
      "doc.titulo": "ChimiGO Urban Food | Comida callejera dominicana en Cuatro Caminos, Madrid",
      "nav.abrir": "Abrir menú",
      "nav.cerrar": "Cerrar menú",
      dias: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
      "horario.rango": "{desde} a {hasta}",
      "horario.y": " y ",
      "horario.cerrado": "Cerrado",
      "horario.hoy": "Hoy",
      "horario.corto": "{dias}, {horas}",
      "estado.abierto": "Abierto ahora · cierra a las {hora}",
      "estado.abreHoy": "Cerrado · abre hoy a las {hora}",
      "estado.abreManana": "Cerrado · abre mañana a las {hora}",
      "estado.abreDia": "Cerrado · abre el {dia} a las {hora}",
      "metro.corto": "Metro {estacion}",
      "pedidos.recoger.titulo": "Recoger en el local",
      "pedidos.recoger.texto": "Llama, haz tu pedido y pásate a recogerlo.",
      "pedidos.recoger.accion": "Llamar",
      "pedidos.whatsapp.texto": "Escríbenos tu pedido por WhatsApp.",
      "pedidos.whatsapp.accion": "Pedir por WhatsApp",
      "pedidos.plataforma.texto": "Pedido a domicilio a través de {nombre}.",
      "pedidos.plataforma.accion": "Pedir en {nombre}",
      "pedidos.reservas.titulo": "Reservar mesa",
      "pedidos.reservas.telefono": "Llámanos para reservar tu mesa.",
      "pedidos.reservas.web": "Reserva tu mesa en línea.",
      "pedidos.reservas.accion": "Reservar",
      "comun.ventanaNueva": "(se abre en una ventana nueva)",
      "opiniones.valoracion": "{media} de 5",
      "opiniones.numero": "· {numero} opiniones en Google",
      "faq.donde.p": "¿Dónde estáis y cómo llego?",
      "faq.donde.r": "Estamos en {calle}, en {barrio} ({lugar}).",
      "faq.donde.metro": " La estación de metro es {estacion} ({lineas}).",
      "faq.horario.p": "¿Qué horario tenéis?",
      "faq.terraza.p": "¿Tenéis terraza?",
      "faq.terraza.r": "Sí, tenemos terraza para disfrutar del chimi al aire libre.",
      "faq.reservas.p": "¿Se puede reservar? ¿Hacéis eventos privados?",
      "faq.reservas.telefono": "Sí, puedes reservar mesa llamando al {telefono}.",
      "faq.reservas.web": "Sí, puedes reservar mesa en nuestra página de reservas.",
      "faq.reservas.eventos":
        " También organizamos eventos privados: cumpleaños, grupos o partidos de fútbol. Llámanos o escríbenos por Instagram y lo preparamos contigo.",
      "faq.domicilio.p": "¿Hacéis pedidos a domicilio?",
      "faq.domicilio.plataformas": "Sí, a través de {plataformas}.",
      "faq.domicilio.recoger": " También puedes llamarnos al {telefono} y recoger tu pedido en el local.",
      "faq.domicilio.soloRecoger": "Puedes llamarnos al {telefono} y recoger tu pedido en el local.",
      "faq.alergenos.p": "¿Tenéis información sobre alérgenos?",
      "faq.alergenos.r": "Consulta los alérgenos de cada plato directamente en el local.",
      "galeria.ver": "Ver foto {n} de {total}: {alt}",
      "galeria.cuenta": "{n} / {total}",
      "contacto.asunto": "Consulta desde la web",
      "contacto.cuerpo": "Nombre: {nombre}\nEmail: {email}\n\n{mensaje}",
      "carta.todo": "Todo",
      "carta.verFicha": "Ver ficha de ",
      "carta.anadir": "Añadir",
      "carta.anadido": "Añadido",
      "carta.anadirAria": "Añadir {nombre} al pedido",
      "carta.alergenosConsulta": "Consulta los alérgenos en el local.",
      "carta.alergenos": "Alérgenos: {lista}.",
      "ficha.anadirPrecio": "Añadir · {precio}",
      "carrito.producto": "{n} producto",
      "carrito.productos": "{n} productos",
      "carrito.verPedido": "Ver tu pedido: {cuenta}, {total}",
      "carrito.unidad": "{precio} / ud.",
      "carrito.cantidadDe": "Cantidad de {nombre}",
      "carrito.menos": "Quitar una unidad de {nombre}",
      "carrito.mas": "Añadir una unidad de {nombre}",
      "carrito.quitar": "Quitar",
      "carrito.quitarAria": "Quitar {nombre} del pedido",
      "carrito.quitado": "{nombre} quitado del pedido",
      "carrito.anunciado": "Añadido: {cantidad} × {nombre}. Total del pedido: {total}",
      "carrito.altInicio": "Pide en el local",
      "carrito.altTelefono": "llamando al ",
      "carrito.altInstagram": "por ",
      "carrito.altO": " o ",
    },
    en: {
      "doc.titulo": "ChimiGO Urban Food | Dominican street food in Cuatro Caminos, Madrid",
      "nav.abrir": "Open menu",
      "nav.cerrar": "Close menu",
      dias: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "horario.rango": "{desde} to {hasta}",
      "horario.y": " and ",
      "horario.cerrado": "Closed",
      "horario.hoy": "Today",
      "horario.corto": "{dias}, {horas}",
      "estado.abierto": "Open now · closes at {hora}",
      "estado.abreHoy": "Closed · opens today at {hora}",
      "estado.abreManana": "Closed · opens tomorrow at {hora}",
      "estado.abreDia": "Closed · opens on {dia} at {hora}",
      "metro.corto": "Metro {estacion}",
      "pedidos.recoger.titulo": "Pick up at the restaurant",
      "pedidos.recoger.texto": "Call us, place your order and come and collect it.",
      "pedidos.recoger.accion": "Call",
      "pedidos.whatsapp.texto": "Send us your order on WhatsApp.",
      "pedidos.whatsapp.accion": "Order on WhatsApp",
      "pedidos.plataforma.texto": "Home delivery through {nombre}.",
      "pedidos.plataforma.accion": "Order on {nombre}",
      "pedidos.reservas.titulo": "Book a table",
      "pedidos.reservas.telefono": "Call us to book your table.",
      "pedidos.reservas.web": "Book your table online.",
      "pedidos.reservas.accion": "Book",
      "comun.ventanaNueva": "(opens in a new window)",
      "opiniones.valoracion": "{media} out of 5",
      "opiniones.numero": "· {numero} Google reviews",
      "faq.donde.p": "Where are you and how do I get there?",
      "faq.donde.r": "We're at {calle}, in {barrio} ({lugar}).",
      "faq.donde.metro": " The metro station is {estacion} ({lineas}).",
      "faq.horario.p": "What are your opening hours?",
      "faq.terraza.p": "Do you have a terrace?",
      "faq.terraza.r": "Yes, we have an outdoor terrace to enjoy your chimi in the open air.",
      "faq.reservas.p": "Can I book a table? Do you host private events?",
      "faq.reservas.telefono": "Yes, you can book a table by calling {telefono}.",
      "faq.reservas.web": "Yes, you can book a table on our booking page.",
      "faq.reservas.eventos":
        " We also host private events: birthdays, groups or football matches. Call us or message us on Instagram and we'll plan it with you.",
      "faq.domicilio.p": "Do you deliver?",
      "faq.domicilio.plataformas": "Yes, through {plataformas}.",
      "faq.domicilio.recoger": " You can also call us on {telefono} and pick up your order at the restaurant.",
      "faq.domicilio.soloRecoger": "You can call us on {telefono} and pick up your order at the restaurant.",
      "faq.alergenos.p": "Do you have allergen information?",
      "faq.alergenos.r": "Please ask about the allergens in each dish at the restaurant.",
      "galeria.ver": "View photo {n} of {total}: {alt}",
      "galeria.cuenta": "{n} / {total}",
      "contacto.asunto": "Enquiry from the website",
      "contacto.cuerpo": "Name: {nombre}\nEmail: {email}\n\n{mensaje}",
      "carta.todo": "All",
      "carta.verFicha": "View details for ",
      "carta.anadir": "Add",
      "carta.anadido": "Added",
      "carta.anadirAria": "Add {nombre} to your order",
      "carta.alergenosConsulta": "Please ask about allergens at the restaurant.",
      "carta.alergenos": "Allergens: {lista}.",
      "ficha.anadirPrecio": "Add · {precio}",
      "carrito.producto": "{n} item",
      "carrito.productos": "{n} items",
      "carrito.verPedido": "View your order: {cuenta}, {total}",
      "carrito.unidad": "{precio} each",
      "carrito.cantidadDe": "Quantity of {nombre}",
      "carrito.menos": "Remove one {nombre}",
      "carrito.mas": "Add one more {nombre}",
      "carrito.quitar": "Remove",
      "carrito.quitarAria": "Remove {nombre} from your order",
      "carrito.quitado": "{nombre} removed from your order",
      "carrito.anunciado": "Added: {cantidad} × {nombre}. Order total: {total}",
      "carrito.altInicio": "Order at the restaurant",
      "carrito.altTelefono": "by calling ",
      "carrito.altInstagram": "via ",
      "carrito.altO": " or ",
      "etiqueta.Especialidad de la casa": "House specialty",
    },
  };

  var originales = {};
  var idioma = leer();

  function leer() {
    try {
      var guardado = localStorage.getItem(CLAVE_GUARDADO);
      if (IDIOMAS.indexOf(guardado) !== -1) return guardado;
    } catch (e) {
      // Sin almacenamiento: se usa el idioma por defecto.
    }
    return "es";
  }

  function guardar() {
    try {
      localStorage.setItem(CLAVE_GUARDADO, idioma);
    } catch (e) {
      // Sin almacenamiento: la elección dura solo esta visita.
    }
  }

  function t(clave, variables) {
    var texto = TEXTOS[idioma][clave];
    if (texto === undefined) texto = TEXTOS.es[clave];
    if (texto === undefined) {
      if (window.console) console.warn("[i18n] Falta la clave: " + clave);
      return clave;
    }
    if (typeof texto !== "string" || !variables) return texto;
    return texto.replace(/\{(\w+)\}/g, function (todo, nombre) {
      return variables[nombre] !== undefined ? variables[nombre] : todo;
    });
  }

  // Texto en el idioma activo, para un campo con versión inglesa opcional (descripcion / descripcionEn).
  function campo(objeto, nombre) {
    if (idioma === "en" && objeto[nombre + "En"]) return objeto[nombre + "En"];
    return objeto[nombre];
  }

  function fijo(clave) {
    if (idioma === "en" && FIJOS_EN[clave] !== undefined) return FIJOS_EN[clave];
    if (idioma === "en" && window.console) console.warn("[i18n] Falta la traducción: " + clave);
    return originales[clave];
  }

  // Guarda el español original de cada clave la primera vez que se ve.
  function recordar(clave, valor) {
    if (originales[clave] === undefined) originales[clave] = valor;
  }

  function aplicar() {
    document.documentElement.lang = idioma;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var clave = el.getAttribute("data-i18n");
      recordar(clave, el.textContent);
      el.textContent = fijo(clave);
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr")
        .split(";")
        .forEach(function (par) {
          var partes = par.split(":");
          var atributo = partes[0].trim();
          var clave = partes[1].trim();
          recordar(clave, el.getAttribute(atributo));
          el.setAttribute(atributo, fijo(clave));
        });
    });

    document.title = t("doc.titulo");

    document.querySelectorAll("[data-idioma]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-idioma") === idioma ? "true" : "false");
    });
  }

  function cambiar(nuevo) {
    if (IDIOMAS.indexOf(nuevo) === -1 || nuevo === idioma) return;
    idioma = nuevo;
    guardar();
    aplicar();
    document.dispatchEvent(new CustomEvent("chimigo:idioma", { detail: { idioma: idioma } }));
  }

  document.addEventListener("click", function (e) {
    var boton = e.target.closest("[data-idioma]");
    if (boton) cambiar(boton.getAttribute("data-idioma"));
  });

  window.ChimiGoI18n = {
    t: t,
    campo: campo,
    cambiar: cambiar,
    idioma: function () {
      return idioma;
    },
  };

  aplicar();
})();
