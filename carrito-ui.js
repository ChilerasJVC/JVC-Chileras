// ----- Redes sociales (escribe tus datos aquí) -----
// Si dejas un dato vacío, ese botón no aparece en la página.
const TIKTOK_USUARIO = "@chilerasjvc"; // tu usuario de TikTok (con o sin @)
const WHATSAPP_NUMERO = "87020835"; // los 8 dígitos de Costa Rica

(function () {
  const tiktok = TIKTOK_USUARIO.trim().replace(/^@/, "");
  if (tiktok) {
    const a = document.getElementById("enlace-tiktok");
    a.href = "https://www.tiktok.com/@" + encodeURIComponent(tiktok);
    a.classList.remove("oculto");
  }

  let numero = WHATSAPP_NUMERO.replace(/\D/g, "");
  if (numero.length === 8) numero = "506" + numero; // código de Costa Rica
  if (numero) {
    const a = document.getElementById("enlace-whatsapp");
    a.href = "https://wa.me/" + numero + "?text=" + encodeURIComponent("Hola JVC Chileras, tengo una consulta.");
    a.classList.remove("oculto");
  }
})();

// ----- Botón flotante del carrito: abrir, cerrar y mantener el número al día -----
// (No cambia nada de app.js: solo se apoya en los elementos que ya existen.)
(function () {
  const boton = document.getElementById("boton-carrito");
  const contador = document.getElementById("contador-carrito");
  const fondo = document.getElementById("fondo-carrito");
  const titulo = document.getElementById("carrito-titulo");

  function abrir() {
    fondo.classList.remove("oculto");
    document.body.classList.add("sin-scroll");
  }

  function cerrar() {
    fondo.classList.add("oculto");
    document.body.classList.remove("sin-scroll");
  }

  boton.addEventListener("click", abrir);
  document.getElementById("cerrar-carrito").addEventListener("click", cerrar);

  // Cierra al tocar fuera de la tarjeta o con la tecla Escape
  fondo.addEventListener("click", function (e) {
    if (e.target === fondo) cerrar();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") cerrar();
  });

  // Al pasar a pagar, se cierra la ventana del carrito
  document.getElementById("finalizar").addEventListener("click", cerrar);

  // El número del botón siempre es el del título del carrito: "Tu carrito (N)"
  let anterior = 0;
  function actualizar() {
    const m = titulo.textContent.match(/\((\d+)\)/);
    const n = m ? Number(m[1]) : 0;
    contador.textContent = n;
    if (n > anterior) {
      boton.classList.remove("salto");
      void boton.offsetWidth; // reinicia la animación
      boton.classList.add("salto");
    }
    anterior = n;
  }

  new MutationObserver(actualizar).observe(titulo, {
    childList: true,
    characterData: true,
    subtree: true
  });
  actualizar();
})();
