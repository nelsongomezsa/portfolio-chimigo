# Fotos del local y de la terraza

Aquí van las fotos del ambiente (local, terraza, partidos, música) para la galería "Chimi · Fútbol · Música".

1. Guarda el original en `img/local/originales/`. Esa carpeta no se sube a git.
2. Genera las versiones para la web, de 1200 px como máximo:

   ```bash
   cwebp -q 80 -resize 1200 0 -metadata none originales/terraza.jpg -o terraza.webp
   sips -s format jpeg -s formatOptions 80 --resampleWidth 1200 originales/terraza.jpg --out terraza.jpg
   ```

3. Añádela en `js/galeria-datos.js` con su tamaño real y una descripción en los dos idiomas:

   ```js
   { webp: "img/local/terraza.webp", jpg: "img/local/terraza.jpg", ancho: 1200, alto: 800, alt: "Terraza de ChimiGO", altEn: "ChimiGO's terrace" },
   ```

Las fotos de personas solo con su permiso.
