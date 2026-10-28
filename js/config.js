/*
 * Datos del local. Es la única fuente de verdad: el resto de la web lee de aquí.
 * Un campo vacío (""), null, [] o "PENDIENTE" se considera "sin dato" y la web
 * oculta todo lo que dependa de él (botones, enlaces, datos estructurados…).
 */
window.CHIMIGO = {
  nombre: "Chimi Go",
  descripcion:
    "Comida callejera dominicana en Cuatro Caminos, Madrid: chimis, quipes, chicharrón con yuca y batidos naturales.",
  tipoCocina: "Dominicana",

  // URL pública de la web, con https:// y barra final. Se usa en SEO y datos estructurados.
  web: "",

  direccion: {
    calle: "Avenida Reina Victoria, 17",
    barrio: "Cuatro Caminos",
    ciudad: "Madrid",
    codigoPostal: "",
    pais: "ES",
  },

  // Coordenadas exactas del local (p. ej. 40.4466). Si están vacías, se usa la dirección.
  coordenadas: { lat: null, lng: null },

  metro: { estacion: "Cuatro Caminos", lineas: ["L1", "L2", "L6"] },

  terraza: true,

  // Franjas por día en formato 24 h: [["13:00", "23:30"]]. Varias franjas: [["13:00", "16:00"], ["20:00", "23:30"]].
  // [] = cerrado. El lunes figura cerrado porque el horario publicado es "martes a domingo".
  horario: {
    lunes: [],
    martes: [["13:00", "23:30"]],
    miercoles: [["13:00", "23:30"]],
    jueves: [["13:00", "23:30"]],
    viernes: [["13:00", "23:30"]],
    sabado: [["13:00", "23:30"]],
    domingo: [["13:00", "23:30"]],
  },

  contacto: {
    telefono: "", // Formato internacional: "+34 600 000 000"
    whatsapp: "", // Formato internacional, sirve con o sin espacios: "+34 600 000 000"
    email: "",
  },

  redes: {
    instagram: "https://www.instagram.com/chimi.go/",
  },

  // Enlaces directos a la ficha del local en cada plataforma.
  pedidos: {
    uberEats: "",
    glovo: "",
    justEat: "",
  },

  // Enlace a la página de reservas (TheFork, CoverManager, formulario propio…).
  reservas: "",
};
