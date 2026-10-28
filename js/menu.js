/*
 * Carta del local. La web genera el menú, las fichas y el carrito desde aquí.
 * - precio: número en euros (6.5 = 6,50 €).
 * - imagen: ruta a la foto. Si el archivo no existe, se muestra un marcador con el nombre del plato.
 * - etiquetas: textos cortos que aparecen en la tarjeta (solo hechos confirmados).
 * - alergenos: lista de alérgenos confirmados por el local. Vacía = "Consulta los alérgenos en el local".
 */
window.CHIMIGO_MENU = {
  categorias: ["Chimis", "Para picar", "Batidos"],

  platos: [
    {
      id: "chimi-pierna",
      nombre: "Chimi de Pierna",
      descripcion: "Pierna de cerdo sazonada a la parrilla, col, tomate y salsa de la casa en pan tostado.",
      precio: 6.5,
      categoria: "Chimis",
      imagen: "img/menu/chimi-pierna.jpg",
      alt: "Chimi de pierna de cerdo con col, tomate y salsas en pan tostado",
      etiquetas: [],
      alergenos: [],
    },
    {
      id: "chimi-ternera",
      nombre: "Chimi de Ternera",
      descripcion: "La versión clásica: ternera picada, especias dominicanas y salsa suave.",
      precio: 6,
      categoria: "Chimis",
      imagen: "img/menu/chimi-ternera.jpg",
      alt: "Chimi clásico de ternera con ensalada",
      etiquetas: ["Clásico"],
      alergenos: [],
    },
    {
      id: "quipes",
      nombre: "Quipes",
      descripcion: "Bocaditos crujientes de trigo rellenos de carne especiada, fritos al momento.",
      precio: 4.5,
      categoria: "Para picar",
      imagen: "img/menu/quipes.jpg",
      alt: "Quipes dominicanos, bocaditos de trigo rellenos de carne",
      etiquetas: [],
      alergenos: [],
    },
    {
      id: "chicharron-yuca",
      nombre: "Chicharrón con Yuca",
      descripcion: "Chicharrón crujiente acompañado de yuca hervida y un toque ácido de cebolla.",
      precio: 7,
      categoria: "Para picar",
      imagen: "img/menu/chicharron-yuca.jpg",
      alt: "Chicharrón crujiente con yuca hervida y cebolla",
      etiquetas: [],
      alergenos: [],
    },
    {
      id: "morir-sonando",
      nombre: "Batido Morir Soñando",
      descripcion: "Naranja y leche condensada bien fría. El postre líquido más querido de RD.",
      precio: 3.5,
      categoria: "Batidos",
      imagen: "img/menu/morir-sonando.jpg",
      alt: "Batido dominicano Morir Soñando, de naranja y leche",
      etiquetas: [],
      alergenos: [],
    },
    {
      id: "guanabana",
      nombre: "Batido de Guanábana",
      descripcion: "Fruta tropical natural, cremoso y refrescante, sin azúcares añadidos.",
      precio: 3.5,
      categoria: "Batidos",
      imagen: "img/menu/guanabana.jpg",
      alt: "Batido natural de guanábana",
      etiquetas: ["Sin azúcares añadidos"],
      alergenos: [],
    },
  ],
};
