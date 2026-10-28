# Fotos de la carta

Los originales (descargados de la ficha de Glovo con permiso del local) están en `originales/`. Esa carpeta no se sube a git.
La web usa versiones optimizadas: WebP de 800 px como máximo, con calidad 80, más un JPG de respaldo. Cada plato las enlaza en el campo `foto` de `js/menu.js`.

## Añadir o cambiar una foto

1. Guarda el original en `originales/`.
2. Genera las dos versiones (sin ampliar fotos de menos de 800 px):

   ```bash
   cwebp -q 80 -resize 800 0 -metadata none originales/plato.jpg -o plato.webp
   sips -s format jpeg -s formatOptions 80 --resampleWidth 800 originales/plato.jpg --out plato.jpg
   ```

3. En `js/menu.js`, pon en ese plato `foto: { webp: "img/menu/plato.webp", jpg: "img/menu/plato.jpg", ancho: 800, alto: 800 }`.

Con `foto: null`, la web muestra un marcador con el nombre del plato.

Las seis batidas de fruta de la ficha de Glovo usaban la misma foto genérica: está una sola vez, en `batidas.webp` y `batidas.jpg`.

## Platos que aún no tienen foto

- Canasta De Costillas (canasta-de-costillas)
- Balón De Oro Pierna (balon-de-oro-pierna)
- Chimi De Pollo (chimi-de-pollo)
- Chimi De Pierna (chimi-de-pierna)
- Chimi Clásico (chimi-clasico)
- Morir Soñando (morir-sonando)
- Papaya (papaya)
- Limonada (limonada)
- Fresa (fresa)
