document.addEventListener("DOMContentLoaded", function () {

    // =========================
    // 1. REGISTRO (si existe)
    // =========================
    const formRegistro = document.getElementById('formRegistro');

    if (formRegistro) {
        formRegistro.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const rol = document.getElementById('regRol').value;
            const materia = document.getElementById('regMateria').value;
            const pass = document.getElementById('regPass').value;

            // Validar materia si es maestro
            if (rol === "maestro" && materia.trim() === "") {
                alert("⚠️ Debes escribir la asignatura");
                return;
            }

            const datosUsuario = {
                nombre: document.getElementById('regNombre').value,
                rol: rol,
                asignatura: (rol === "maestro") ? materia : null,
                pass: pass
            };

            localStorage.setItem('usuarioRegistrado', JSON.stringify(datosUsuario));

            alert('✅ Registro exitoso como ' + rol);
            window.location.href = "index.html"; 
        });
    }

    // =========================
    // 2. MOSTRAR / OCULTAR MATERIA
    // =========================
    const selectRol = document.getElementById('regRol');

    if (selectRol) {
        selectRol.addEventListener('change', verificarRol);
    }

    function verificarRol() {
        const rol = document.getElementById('regRol').value;
        const campo = document.getElementById('campoAsignatura');

        if (!campo) return;

        campo.style.display = (rol === "maestro") ? "block" : "none";
        campo.style.opacity = (rol === "maestro") ? "1" : "0";
    }

    // =========================
    // 3. VERIFICACIÓN DE SESIÓN
    // =========================
    const usuario = JSON.parse(localStorage.getItem('usuarioRegistrado'));

    // Solo redirige si NO estamos en registro
    if (!usuario && !formRegistro) {
        window.location.href = "registro.html";
        return;
    }

    const nombreUser = document.getElementById('nombreUser');
    if (nombreUser && usuario) nombreUser.innerText = "👤 " + usuario.nombre;

    // =========================
    // 4. LÓGICA DE ROLES
    // =========================
    const seccionMaestro = document.getElementById('seccionMaestro');
    const inputMateria = document.getElementById('materiaNombre');
    const rolTag = document.getElementById('rolTag');
    const buscadorContenedor = document.getElementById('buscadorContenedor');

    if (usuario) {
        if (usuario.rol === "maestro") {
            if (seccionMaestro) seccionMaestro.style.display = "block";
            if (rolTag) rolTag.innerText = "MAESTRO";
            if (inputMateria) {
                inputMateria.value = usuario.asignatura || "Materia General";
                inputMateria.disabled = true; 
            }
            if (buscadorContenedor) buscadorContenedor.style.display = "none";
        } else {
            if (seccionMaestro) seccionMaestro.style.display = "none";
            if (rolTag) rolTag.innerText = "ESTUDIANTE";
            if (buscadorContenedor) buscadorContenedor.style.display = "block";
        }
    }

    // =========================
    // 5. ANIMACIONES
    // =========================
    if (typeof Typed !== 'undefined' && document.getElementById("typed")) {
        new Typed('#typed', {
            strings: ['Individuales', 'en Tiempo Real', 'Actualizadas'],
            typeSpeed: 60,
            backSpeed: 40,
            loop: true,
            showCursor: false
        });
    }

    // =========================
    // 6. TABLA DE NOTAS
    // =========================
    dibujarTabla();

    const inputBusqueda = document.getElementById('inputBusqueda');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', function(e) {
            const texto = e.target.value.toLowerCase();
            dibujarTabla(texto);
        });
    }

});

// =========================
// FUNCIONES GLOBALES
// =========================

// Guardar nota
function guardarNuevaNota() {
    const usuario = JSON.parse(localStorage.getItem('usuarioRegistrado'));
    const notaInput = document.getElementById('materiaNota');
    const notaValue = notaInput.value;

    if (notaValue === "" || notaValue < 0 || notaValue > 100) {
        alert("Por favor, ingresa una nota válida entre 0 y 100");
        return;
    }

    let notasSistema = JSON.parse(localStorage.getItem('notasSistema')) || [];
    const index = notasSistema.findIndex(n => n.materia === usuario.asignatura);
    
    if (index !== -1) {
        notasSistema[index].nota = parseInt(notaValue);
    } else {
        notasSistema.push({ 
            materia: usuario.asignatura, 
            nota: parseInt(notaValue),
            maestro: usuario.nombre 
        });
    }

    localStorage.setItem('notasSistema', JSON.stringify(notasSistema));
    notaInput.value = "";
    alert("¡Nota publicada!");
    dibujarTabla();
}

// Dibujar tabla
function dibujarTabla(filtro = "") {
    const cuerpoTabla = document.getElementById("tabla-cuerpo");
    if (!cuerpoTabla) return;

    const notas = JSON.parse(localStorage.getItem('notasSistema')) || [];

    const notasFiltradas = notas.filter(item => 
        item.materia.toLowerCase().includes(filtro)
    );

    cuerpoTabla.innerHTML = "";

    if (notasFiltradas.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#666; padding:30px;">No se encontraron materias.</td></tr>`;
        return;
    }

    notasFiltradas.forEach(item => {
        let esAprobado = item.nota >= 70;
        let estadoTexto = esAprobado ? "✅ Aprobado" : "❌ Reprobado";
        let claseCSS = esAprobado ? "aprobado" : "reprobado";

        let fila = `
            <tr>
                <td><strong>${item.materia}</strong></td>
                <td>${item.nota} / 100</td>
                <td class="${claseCSS}">${estadoTexto}</td>
                <td style="font-size: 12px; color: #888;">Prof. ${item.maestro}</td>
            </tr>
        `;
        cuerpoTabla.innerHTML += fila;
    });
}

// Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('usuarioRegistrado');
    window.location.href = "registro.html";
}