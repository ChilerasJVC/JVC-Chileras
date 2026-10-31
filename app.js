 lo que se suma al precio si esa variedad cuesta más (0 = mismo precio)
const variedades = [
  { id: "mango", nombre: "Chilera con mango", extra: 0 },
  { id: "simple", nombre: "Chilera simple", extra: 0 }
];

let carrito = [];
let seleccion = { producto: null, variedad: null };
let temporizadorMensaje = null;
let nombreCliente = "";

// ---------- Utilidades ----------
function dinero(n) {
  return "₡" + n.toLocaleString("es-CR");
}

// Evita que un texto escrito por el cliente se interprete como código
function escapar(texto) {
  const d = document.createElement("div");
  d.textContent = texto;
  return d.innerHTML;
}

function nuevoId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function leerNombre() {
  try { return localStorage.getItem("nombreCliente") || ""; } catch (e) { return ""; }
}

function guardarNombre(n) {
  try { localStorage.setItem("nombreCliente", n); } catch (e) {}
}

function totalCarrito() {
  return carrito.reduce(function (suma, item) { return suma + item.precio; }, 0);
}

// Frasco con trocitos de mango (usa el frasco normal y le agrega mango)
function frascoMango(id, alto) {
  const mango =
    '<rect x="44" y="46" width="12" height="8" rx="4" fill="#f9b233"/>' +
    '<rect x="60" y="51" width="11" height="7" rx="3.5" fill="#fbc02d" transform="rotate(15 65 54)"/>' +
    '<rect x="26" y="108" width="8" height="7" rx="3" fill="#f9b233"/>' +
    '<rect x="88" y="128" width="7" height="8" rx="3" fill="#fbc02d"/>';
  return frascoSVG(id, alto).replace("<!-- borde del vidrio -->", mango + "<!-- borde del vidrio -->");
}

function dibujarFrasco(variedad, id, alto) {
  return variedad.id === "mango" ? frascoMango(id, alto) : frascoSVG(id, alto);
}

function mostrar(idPantalla) {
  document.querySelectorAll(".pantalla").forEach(function (p) {
    p.classList.add("oculto");
  });
  document.getElementById(idPantalla).classList.remove("oculto");
  actualizarEstrella(idPantalla);
  window.scrollTo(0, 0);
}

// Estrella de oferta: solo aparece al elegir un tamaño (pantallas de variedad y personalizar)
function actualizarEstrella(idPantalla) {
  const estrella = document.getElementById("estrella-oferta");
  const conOferta = (idPantalla === "pantalla-variedad" || idPantalla === "pantalla-final")
    && seleccion.producto && seleccion.producto.oferta;
  if (conOferta) {
    document.getElementById("oferta-precio").textContent = dinero(seleccion.producto.oferta);
  }
  estrella.classList.toggle("oculto", !conOferta);
}

function mostrarMensaje(texto) {
  const m = document.getElementById("mensaje");
  m.textContent = texto;
  m.classList.remove("oculto");
  clearTimeout(temporizadorMensaje);
  temporizadorMensaje = setTimeout(function () {
    m.classList.add("oculto");
  }, 3000);
}

// ---------- Pantalla del nombre y celular ----------
let telefonoCliente = "";

function leerTelefono() {
  try { return localStorage.getItem("telefonoCliente") || ""; } catch (e) { return ""; }
}

function guardarTelefono(t) {
  try { localStorage.setItem("telefonoCliente", t); } catch (e) {}
}

// El campo de celular solo acepta números
document.getElementById("input-telefono").addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 8);
});

document.getElementById("form-nombre").addEventListener("submit", function (e) {
  e.preventDefault();
  const n = document.getElementById("input-nombre").value.trim();
  const t = document.getElementById("input-telefono").value.replace(/\D/g, "");
  const errorNombre = document.getElementById("error-nombre");
  const errorTelefono = document.getElementById("error-telefono");

  errorNombre.classList.toggle("oculto", n !== "");
  errorTelefono.classList.toggle("oculto", t.length === 8);
  if (!n || t.length !== 8) return;

  nombreCliente = n;
  telefonoCliente = t;
  guardarNombre(n);
  guardarTelefono(t);
  entrarATienda();
});

function entrarATienda() {
  document.getElementById("nombre-cliente").textContent = nombreCliente;
  mostrar("pantalla-inicio");
}

document.getElementById("cambiar-nombre").addEventListener("click", function () {
  document.getElementById("input-nombre").value = nombreCliente;
  document.getElementById("input-telefono").value = telefonoCliente;
  mostrar("pantalla-nombre");
});

// ---------- Pantalla 1: tamaños ----------
const catalogo = document.getElementById("catalogo");

productos.forEach(function (p) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "producto";
  tarjeta.setAttribute("role", "button");
  tarjeta.tabIndex = 0;
  tarjeta.innerHTML = `
    <h3>${p.nombre}</h3>
    <p class="volumen">${p.volumen}</p>
    <div class="foto">${frascoSVG("p" + p.id, p.alto)}</div>
    <p class="precio">${dinero(p.precio)}</p>
  `;
  tarjeta.addEventListener("click", function () {
    elegirProducto(p);
  });
  tarjeta.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      elegirProducto(p);
    }
  });
  catalogo.appendChild(tarjeta);
});

function elegirProducto(p) {
  seleccion.producto = p;
  document.getElementById("titulo-variedad").textContent = p.nombre + ": elige la variedad";
  mostrar("pantalla-variedad");
}

// ---------- Pantalla 2: variedad ----------
const contenedorOpciones = document.getElementById("opciones-variedad");

variedades.forEach(function (v) {
  const boton = document.createElement("button");
  boton.className = "opcion";
  boton.innerHTML = `
    <div class="foto">${dibujarFrasco(v, "v" + v.id, 130)}</div>
    <span>${v.nombre}</span>
  `;
  boton.addEventListener("click", function () {
    elegirVariedad(v);
  });
  contenedorOpciones.appendChild(boton);
});

function elegirVariedad(v) {
  seleccion.variedad = v;
  const precio = seleccion.producto.precio + v.extra;
  document.getElementById("resumen-eleccion").innerHTML = `
    <div class="foto">${dibujarFrasco(v, "f", seleccion.producto.alto)}</div>
    <p><strong>${v.nombre}</strong> · ${seleccion.producto.tamano}</p>
    <p class="precio">${dinero(precio)}</p>
  `;
  document.querySelector('input[name="picor"][value="Normal"]').checked = true;
  document.getElementById("nota").value = "";
  mostrar("pantalla-final");
}

// ---------- Botones de volver ----------
document.getElementById("volver-inicio").addEventListener("click", function () {
  mostrar("pantalla-inicio");
});
document.getElementById("volver-variedad").addEventListener("click", function () {
  mostrar("pantalla-variedad");
});
document.getElementById("volver-carrito").addEventListener("click", function () {
  mostrar("pantalla-inicio");
});
document.getElementById("volver-tienda").addEventListener("click", function () {
  mostrar("pantalla-inicio");
});

// ---------- Pantalla 3: agregar al carrito ----------
document.getElementById("agregar-carrito").addEventListener("click", function () {
  const picor = document.querySelector('input[name="picor"]:checked').value;
  const nota = document.getElementById("nota").value.trim();

  carrito.push({
    nombre: seleccion.variedad.nombre + " · " + seleccion.producto.tamano,
    precio: seleccion.producto.precio + seleccion.variedad.extra,
    picor: picor,
    nota: nota
  });

  dibujarCarrito();
  mostrar("pantalla-inicio");
  mostrarMensaje("Artículo agregado al carrito");
});

// ---------- Carrito ----------
function dibujarCarrito() {
  const lista = document.getElementById("carrito-lista");
  const total = document.getElementById("carrito-total");
  document.getElementById("carrito-titulo").textContent = "Tu carrito (" + carrito.length + ")";
  document.getElementById("finalizar").classList.toggle("oculto", carrito.length === 0);

  if (carrito.length === 0) {
    lista.innerHTML = '<p class="vacio">Tu carrito está vacío</p>';
    total.textContent = "";
    return;
  }

  lista.innerHTML = carrito.map(function (item, i) {
    return `
      <div class="item">
        <div>
          <strong>${escapar(item.nombre)}</strong><br>
          <small>Picor: ${escapar(item.picor)}${item.nota ? " · Nota: " + escapar(item.nota) : ""}</small>
        </div>
        <div class="item-der">${dinero(item.precio)} <button class="quitar" data-i="${i}" title="Quitar">✕</button></div>
      </div>
    `;
  }).join("");
  total.textContent = "Total: " + dinero(totalCarrito());
}

document.getElementById("carrito-lista").addEventListener("click", function (e) {
  if (e.target.classList.contains("quitar")) {
    carrito.splice(Number(e.target.dataset.i), 1);
    dibujarCarrito();
  }
});

// ---------- Pantalla 4: pago y comprobante ----------
document.getElementById("finalizar").addEventListener("click", function () {
  const total = totalCarrito();

  document.getElementById("resumen-pedido").innerHTML = carrito.map(function (item) {
    return `
      <div class="item">
        <div>
          <strong>${escapar(item.nombre)}</strong><br>
          <small>Picor: ${escapar(item.picor)}${item.nota ? " · Nota: " + escapar(item.nota) : ""}</small>
        </div>
        <div class="item-der">${dinero(item.precio)}</div>
      </div>
    `;
  }).join("");

  document.getElementById("total-pago").textContent = "Total: " + dinero(total);
  document.getElementById("sinpe-numero").textContent = SINPE_NUMERO;
  document.getElementById("sinpe-nombre").textContent = SINPE_NOMBRE;
  document.getElementById("sinpe-monto").textContent = dinero(total);

  document.getElementById("comprobante").value = "";
  document.getElementById("vista-previa").classList.add("oculto");
  document.getElementById("error-pago").classList.add("oculto");
  mostrar("pantalla-pago");
});

document.getElementById("comprobante").addEventListener("change", function () {
  const archivo = this.files[0];
  const img = document.getElementById("vista-previa");
  if (!archivo) {
    img.classList.add("oculto");
    return;
  }
  img.src = URL.createObjectURL(archivo);
  img.classList.remove("oculto");
});

function mostrarErrorPago(texto) {
  const e = document.getElementById("error-pago");
  e.textContent = texto;
  e.classList.remove("oculto");
}

const TIPOS_IMAGEN = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// ----- Método de pago: SINPE Móvil o efectivo -----
function metodoElegido() {
  return document.querySelector('input[name="metodo"]:checked').value;
}

function actualizarMetodo() {
  const esSinpe = metodoElegido() === "sinpe";
  document.getElementById("bloque-sinpe").classList.toggle("oculto", !esSinpe);
  document.getElementById("bloque-efectivo").classList.toggle("oculto", esSinpe);
  document.getElementById("error-pago").classList.add("oculto");
}

document.querySelectorAll('input[name="metodo"]').forEach(function (r) {
  r.addEventListener("change", actualizarMetodo);
});

// Cada vez que se abre la pantalla de pago, vuelve a SINPE Móvil
document.getElementById("finalizar").addEventListener("click", function () {
  document.querySelector('input[name="metodo"][value="sinpe"]').checked = true;
  document.getElementById("efectivo-monto").textContent = dinero(totalCarrito());
  actualizarMetodo();
});

document.getElementById("enviar-pedido").addEventListener("click", async function () {
  const boton = this;
  const metodo = metodoElegido();
  const archivo = document.getElementById("comprobante").files[0];
  let ext = null;

  // Con SINPE Móvil el comprobante es obligatorio; con efectivo no hace falta
  if (metodo === "sinpe") {
    if (!archivo) {
      mostrarErrorPago("Sube la captura del comprobante de SINPE Móvil.");
      return;
    }
    ext = TIPOS_IMAGEN[archivo.type];
    if (!ext) {
      mostrarErrorPago("La imagen debe ser JPG, PNG o WEBP.");
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      mostrarErrorPago("La imagen pesa más de 5 MB. Usa una captura de pantalla.");
      return;
    }
  }

  document.getElementById("error-pago").classList.add("oculto");
  const textoOriginal = boton.textContent;
  boton.disabled = true;
  boton.textContent = "Enviando...";

  try {
    const id = nuevoId();
    let ruta = null;

    // 1) Si paga por SINPE, subir la foto del comprobante
    if (metodo === "sinpe") {
      ruta = id + "." + ext;
      const subida = await db.storage.from("comprobantes").upload(ruta, archivo, { contentType: archivo.type });
      if (subida.error) throw subida.error;
    }

    // 2) Guardar el pedido
    const res = await db.from("pedidos").insert({
      id: id,
      cliente: nombreCliente,
      telefono: telefonoCliente,
      items: carrito,
      total: totalCarrito(),
      comprobante: ruta,
      metodo_pago: metodo
    });
    if (res.error) throw res.error;

    carrito = [];
    dibujarCarrito();
    document.getElementById("mensaje-exito").textContent = metodo === "sinpe"
      ? "Gracias, " + nombreCliente + ". Recibimos tu pedido y tu comprobante. Lo revisaremos y te contactaremos pronto."
      : "Gracias, " + nombreCliente + ". Recibimos tu pedido. Pagarás en efectivo y te contactaremos pronto para coordinar.";
    mostrar("pantalla-exito");
  } catch (err) {
    console.error(err);
    mostrarErrorPago("No se pudo enviar el pedido. Revisa tu conexión e intenta de nuevo.");
  } finally {
    boton.disabled = false;
    boton.textContent = textoOriginal;
  }
});

// ---------- Inicio ----------
nombreCliente = leerNombre();
telefonoCliente = leerTelefono();
dibujarCarrito();
if (nombreCliente && telefonoCliente) {
  entrarATienda();
} else {
  document.getElementById("input-nombre").value = nombreCliente;
  mostrar("pantalla-nombre");
}
