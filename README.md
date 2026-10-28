# Chimi Go · web de una sola página

**Web para Chimi Go, un local de comida callejera dominicana en Cuatro Caminos (Madrid): presentación, menú, ubicación y contacto en una sola página.**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

> **English summary:** Single-page website for a Dominican street-food place in Madrid, built with semantic HTML and plain CSS: custom properties, flexbox, grid, three responsive breakpoints, an embedded map and a contact form. No frameworks.

![Captura de la web de Chimi Go](docs/captura.png)

---

## Qué tiene

- **Carta interactiva** generada desde `js/menu.js` (31 platos de su ficha de Glovo): filtros por categoría, ficha de cada plato con extras y carrito con pedido por WhatsApp.
- **Horario en vivo** con la hora de Madrid ("Abierto ahora · cierra a las 23:30") y el día de hoy resaltado.
- **Pedidos y reservas**: recoger en el local, Glovo, Uber Eats o Just Eat, según los enlaces que haya en `js/config.js`.
- **Galería** "Chimi · Fútbol · Música" con visor accesible por teclado y que se desliza en el móvil.
- **Opiniones** (enlace a Google Maps, sin reseñas inventadas), **preguntas frecuentes** y **eventos privados**.
- **ES / EN**: la interfaz y las descripciones se traducen; los nombres de los platos se quedan en español.
- **Instalable y sin conexión** (PWA): `manifest.json` y `sw.js`.
- **SEO**: Open Graph, JSON-LD `Restaurant` con la carta completa (`Menu` y `MenuItem`), `sitemap.xml` y `robots.txt`.

## Estructura

```
index.html
manifest.json, sw.js, robots.txt, sitemap.xml
css/styles.css
js/config.js         ← datos del local (rellenar aquí)
js/menu.js           ← carta: platos, precios, extras, fotos y traducciones
js/galeria-datos.js  ← fotos de la galería
js/i18n.js           ← textos en inglés
js/main.js           ← datos, horario, pedidos, FAQ, JSON-LD
js/carta.js          ← menú, ficha y carrito
js/galeria.js        ← galería y visor
img/menu/            ← fotos de los platos (ver LEEME.md)
img/local/           ← fotos del local y la terraza (ver LEEME.md)
```

Un dato vacío en `js/config.js` (o `"PENDIENTE"`) oculta todo lo que depende de él.

**Al publicar cambios**, sube `VERSION` en `sw.js` (por ejemplo, de `chimigo-v1` a `chimigo-v2`) para que los móviles que ya tienen la web guardada reciban los archivos nuevos.

## Stack

| Parte | Técnica |
|---|---|
| Estructura | HTML5 semántico (`header`, `main`, `section`, `footer`) |
| Estilos | CSS con variables propias, flexbox y grid |
| Lógica | JavaScript sin dependencias |
| Sin conexión | Service worker y manifest (PWA) |
| Tipografía | Google Fonts (Poppins y Fredoka) |

## Cómo verla

1. Clona el repositorio:
   ```bash
   git clone https://github.com/nelsongomezsa/portfolio-chimigo.git
   ```
2. Sírvela en local, por ejemplo con `python3 -m http.server`, y abre `http://localhost:8000`.

## Autor

**Nelson Gómez Sánchez** · Estudiante de DAM y del Máster en Data & Analytics · [nelsongomezsa.github.io](https://nelsongomezsa.github.io)
