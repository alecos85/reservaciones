// ============================
// Configuración base
// ============================

// URL de la API donde se harán las peticiones.
// Cambia el puerto si tu backend usa otro.
const API_URL = "https://periko.bounceme.net/api/reservaciones";


// ============================
// Función para validar formulario
// ============================

function validarFormulario() {
    // Tomamos los valores de los campos de texto y quitamos espacios extra
    const nombre = document.querySelector('input[name="nombre"]').value.trim();
    const apellido = document.querySelector('input[name="apellido"]').value.trim();
    const telefono = document.querySelector('input[name="telefono"]').value.trim();
    const habitacion = document.querySelector('input[name="habitacion"]').value.trim();
    const fechaEntrada = document.querySelector('input[name="fecha_entrada"]').value;
    const fechaSalida = document.querySelector('input[name="fecha_salida"]').value;
    const precio = document.querySelector('input[name="precio"]').value.trim();

    // Validamos que ningún campo esté vacío
    if (!nombre || !apellido || !telefono || !habitacion || !fechaEntrada || !fechaSalida || !precio) {
        alert("Por favor, completa todos los campos.");
        return false;
    }

    // Validamos que el precio sea un número positivo
    if (isNaN(precio) || precio <= 0) {
        alert("El precio debe ser un número positivo.");
        return false;
    }

    // Validamos que la fecha de entrada sea menor que la de salida
    if (new Date(fechaEntrada) >= new Date(fechaSalida)) {
        alert("La fecha de entrada debe ser anterior a la fecha de salida.");
        return false;
    }

    // Si todas las validaciones pasan, devolvemos true
    return true;
}


// ============================
// Funciones de API (fetch)
// ============================

// Obtiene todas las reservaciones desde el backend
async function getReservaciones() {
    const res = await fetch(API_URL); // Llamada GET
    if (!res.ok) throw new Error("Error al obtener reservaciones");
    return res.json(); // Devuelve la respuesta como objeto JSON
}

// Crea una nueva reservación en el backend
async function createReservacion(data) {
    const res = await fetch(API_URL, {
        method: "POST", // Indicamos que es un POST
        headers: { "Content-Type": "application/json" }, // Avisamos que enviamos JSON
        body: JSON.stringify(data) // Convertimos el objeto en JSON para enviarlo
    });
    if (!res.ok) throw new Error("Error al crear reservación");
    return res.json();
}

// Elimina una reservación según su ID
async function deleteReservacion(id) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE" // Indicamos que es un DELETE
    });
    if (!res.ok) throw new Error("Error al eliminar reservación");
}


// ============================
// Funciones de UI
// ============================

// Convierte fecha ISO a formato legible (dd/mm/yyyy)
function formatearFecha(fechaISO) {
    if (!fechaISO) return "";
    return new Date(fechaISO).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
}

// Crea dinámicamente una fila de tabla con los datos de una reservación
function renderFila(reservacion) {
    const fila = document.createElement("tr"); // Creamos un <tr>
    fila.innerHTML = `
        <td>${reservacion.nombre}</td>
        <td>${reservacion.apellido}</td>
        <td>${reservacion.telefono}</td>
        <td>${reservacion.habitacion}</td>
        <td>${formatearFecha(reservacion.fecha_entrada)}</td>
        <td>${formatearFecha(reservacion.fecha_salida)}</td>
        <td>$${reservacion.precio}</td>
        <td>
            <!-- Botón de eliminar que llama a eliminarReservacionUI -->
            <button class="btn" onclick="eliminarReservacionUI('${reservacion._id}')">Eliminar</button>
        </td>
    `;
    return fila;
}

// Carga todas las reservaciones y las pinta en la tabla
async function cargarReservaciones() {
    const tbody = document.querySelector("#tabla-contactos tbody");
    tbody.innerHTML = ""; // Limpia la tabla antes de llenarla
    try {
        const reservaciones = await getReservaciones(); // Llamada al backend
        reservaciones.forEach(reservacion => {
            tbody.appendChild(renderFila(reservacion)); // Agrega cada fila
        });
    } catch (error) {
        alert("No se pudieron cargar las reservaciones.");
        console.error(error);
    }
}


// ============================
// Funciones para eventos
// ============================

// Maneja el envío del formulario
async function agregarContacto(event) {
    event.preventDefault(); // Evita que la página se recargue

    // Extraemos los datos del formulario en un objeto
    const data = Object.fromEntries(new FormData(document.getElementById("formulario")));
    data.precio = Number(data.precio); // Convertimos precio a número

    // Validamos antes de enviar
    if (!validarFormulario(data)) return;

    try {
        await createReservacion(data); // Llamamos a la API para crear la reservación
        document.getElementById("formulario").reset(); // Reseteamos el formulario
        cargarReservaciones(); // Refrescamos la tabla
    } catch (error) {
        alert("No se pudo guardar la reservación.");
        console.error(error);
    }
}

// Confirma y elimina una reservación
async function eliminarReservacionUI(id) {
    if (!confirm("¿Seguro que deseas eliminar esta reservación?")) return;

    try {
        await deleteReservacion(id);
        cargarReservaciones(); // Refresca la tabla después de eliminar
    } catch (error) {
        alert("No se pudo eliminar la reservación.");
        console.error(error);
    }
}


// ============================
// Inicialización
// ============================

// Escuchamos el evento submit del formulario para crear reservación
document.getElementById("formulario").addEventListener("submit", agregarContacto);

// Cargamos las reservaciones al cargar la página

cargarReservaciones();
