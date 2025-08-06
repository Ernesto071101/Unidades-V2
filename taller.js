// taller.js

// Almacena la lista de operadores para facilitar la edición
let operadores = [];

// Base URL para tus scripts PHP. ¡AJUSTA ESTA RUTA SI ES NECESARIO!
const API_BASE_URL = 'http://localhost/UnidadesC/'; 

// Funciones para cargar datos al inicio
document.addEventListener('DOMContentLoaded', () => {
    cargarUnidades();
    cargarOperadores();
});


// --- Funciones Auxiliares para la API ---

/**
 * Función genérica para enviar datos (POST, PUT, DELETE) a la API.
 * @param {string} url - La URL del endpoint de la API.
 * @param {string} method - El método HTTP ('POST', 'PUT', 'DELETE').
 * @param {Object} data - Los datos a enviar en el cuerpo de la petición.
 * @returns {Promise<Object>} - La respuesta de la API en formato JSON.
 */
async function sendData(url, method, data) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        };
        const response = await fetch(url, options);
        const result = await response.json();

        // Manejo de errores genérico del servidor
        if (!response.ok) {
            console.error('Error de servidor:', result.message || 'Error desconocido');
            return { status: 'error', message: result.message || 'Error desconocido' };
        }
        
        return result;
    } catch (error) {
        console.error(`Error en la petición ${method} a ${url}:`, error);
        return { status: 'error', message: 'Error de conexión. Revisa la consola para más detalles.' };
    }
}

/**
 * Función genérica para obtener datos (GET) de la API.
 * @param {string} url - La URL del endpoint de la API, incluyendo parámetros de búsqueda.
 * @returns {Promise<Array<Object>|Object>} - La respuesta de la API.
 */
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'success') {
            return data.data;
        } else {
            console.error('Error al obtener datos:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error en la petición GET:', error);
        return [];
    }
}



// =========================================================================
// GESTIÓN DE UNIDADES
// =========================================================================

function cargarUnidades() {
    fetch('unidades.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                mostrarUnidades(data.data);
                popularSelectsUnidades(data.data);
            } else {
                console.error('Error al cargar unidades:', data.message);
            }
        })
        .catch(error => console.error('Error en la petición de unidades:', error));
}

function mostrarUnidades(unidades) {
    const listaMantenimiento = document.getElementById('listaMantenimiento');
    const listaParaAsignar = document.getElementById('listaParaAsignar');
    const listaEnRuta = document.getElementById('listaEnRuta');
    const listaConsolidada = document.getElementById('listaConsolidada');
    const unidadesAdminContent = document.getElementById('unidadesAdminContent');

    listaMantenimiento.innerHTML = '';
    listaParaAsignar.innerHTML = '';
    listaEnRuta.innerHTML = '';
    listaConsolidada.innerHTML = '';
    unidadesAdminContent.innerHTML = '';

    unidades.forEach(unidad => {
        const unitItem = document.createElement('div');
        unitItem.className = 'unit-item';
        unitItem.dataset.id = unidad.num_economico; 
        unitItem.innerHTML = `
            <div>
                <strong>${unidad.num_economico}</strong> - ${unidad.marca} ${unidad.modelo}<br>
                Placas: ${unidad.placas}<br>
                Status: ${unidad.status}<br>
                Operador: ${unidad.operador_nombre ? unidad.operador_nombre : 'Sin Asignar'}
            </div>
        `;

        const adminUnitItem = document.createElement('div');
        adminUnitItem.className = 'unit-item';
        adminUnitItem.dataset.id = unidad.num_economico;
        adminUnitItem.innerHTML = `
            <div>
                <strong>${unidad.num_economico}</strong> - ${unidad.marca} ${unidad.modelo}<br>
                Placas: ${unidad.placas}<br>
                Status: ${unidad.status}<br>
                Operador: ${unidad.operador_nombre ? unidad.operador_nombre : 'Sin Asignar'}
            </div>
        `;

        if (unidad.status === 'En Mantenimiento') {
            listaMantenimiento.appendChild(unitItem);
        } else if (unidad.status === 'Lista para Asignación') {
            listaParaAsignar.appendChild(unitItem);
        } else if (unidad.status === 'En Ruta') {
            listaEnRuta.appendChild(unitItem);
        }

        listaConsolidada.appendChild(unitItem.cloneNode(true));
        unidadesAdminContent.appendChild(adminUnitItem);
    });
}

function popularSelectsUnidades(unidades) {
    const selects = [
        document.getElementById('otUnidadId'),
        document.getElementById('selectUnidadVerOT'),
        document.getElementById('selectUnidadAsignarOperador')
    ];

    selects.forEach(select => {
        select.innerHTML = '';
        unidades.forEach(unidad => {
            const option = document.createElement('option');
            option.value = unidad.num_economico; 
            option.textContent = `${unidad.num_economico} - ${unidad.placas}`;
            select.appendChild(option);
        });
    });
}

function agregarUnidad() {
    const numEconomico = prompt('Ingrese el número económico de la unidad:');
    if (!numEconomico) return;
    const placas = prompt('Ingrese las placas de la unidad:');
    if (!placas) return;
    const modelo = prompt('Ingrese el modelo de la unidad:');
    if (!modelo) return;
    const marca = prompt('Ingrese la marca de la unidad:');
    if (!marca) return;
    const ordenMantenimiento = prompt('Ingrese la descripción de la orden de mantenimiento:');

    fetch('unidades.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            action: 'agregar', 
            num_economico: numEconomico, 
            placas: placas, 
            modelo: modelo, 
            marca: marca, 
            orden_mantenimiento: ordenMantenimiento 
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            cargarUnidades();
        }
    });
}

function completarMantenimiento() {
    const unidadId = prompt('Ingrese el número económico de la unidad a completar mantenimiento:');
    if (!unidadId) return;

    fetch('unidades.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            action: 'completar_mantenimiento', 
            num_economico: unidadId
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            cargarUnidades();
        }
    });
}

function asignarRuta() {
    const unidadId = prompt('Ingrese el número económico de la unidad a asignar a ruta:');
    if (!unidadId) return;
    const ruta = prompt('Ingrese la descripción de la ruta a asignar:');
    if (!ruta) return;

    fetch('unidades.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            action: 'asignar_ruta', 
            num_economico: unidadId,
            ruta_asignada: ruta 
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            cargarUnidades();
        }
    });
}

function regresarDeRuta() {
    const unidadId = prompt('Ingrese el número económico de la unidad que regresa de ruta:');
    if (!unidadId) {
        return;
    }

    // Pregunta al usuario si la unidad requiere mantenimiento
    const necesitaMantenimiento = confirm('¿La unidad necesita mantenimiento?');

    let nuevoStatus;
    if (necesitaMantenimiento) {
        nuevoStatus = 'En Mantenimiento';
    } else {
        nuevoStatus = 'Lista para Asignación';
    }

    // Se actualiza el estado de la unidad en el backend
    fetch(API_BASE_URL + 'unidades.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'regresar_ruta',
            num_economico: unidadId,
            status: nuevoStatus // Enviamos el nuevo estado al servidor
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            cargarUnidades();
        }
    })
    .catch(error => console.error('Error:', error));
}

function eliminarUnidad() {
    const unidadId = prompt('Ingrese el número económico de la unidad a eliminar:');
    if (!unidadId) return;

    if (confirm(`¿Estás seguro de que quieres eliminar la unidad ${unidadId}?`)) {
        fetch('unidades.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'eliminar', 
                num_economico: unidadId
            })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.status === 'success') {
                cargarUnidades();
            }
        });
    }
}

// =========================================================================
// GESTIÓN DE OPERADORES
// =========================================================================

function cargarOperadores() {
    fetch('operadores.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                operadores = data.data; // Almacenamos la lista para la edición en línea
                mostrarOperadores(operadores);
                popularSelectsOperadores(operadores);
            } else {
                console.error('Error al cargar operadores:', data.message);
            }
        })
        .catch(error => console.error('Error en la petición de operadores:', error));
}

function mostrarOperadores(operadores) {
    const operadoresAdminContent = document.getElementById('operadoresAdminContent');
    operadoresAdminContent.innerHTML = '';
    operadores.forEach(operador => {
        const operadorItem = document.createElement('div');
        operadorItem.className = 'operador-item';
        operadorItem.dataset.operadorId = operador.id;
        operadorItem.innerHTML = `
            <div class="operador-info" id="operador-info-${operador.id}">
                ID: ${operador.id}, <strong>${operador.nombre} ${operador.apellido_paterno} ${operador.apellido_materno || ''}</strong>
            </div>
            <div class="operador-edit-form" id="operador-edit-form-${operador.id}" style="display: none;">
                ID: ${operador.id}
                <input type="text" class="edit-nombre" value="${operador.nombre || ''}" placeholder="Nombre" required>
                <input type="text" class="edit-apellido-paterno" value="${operador.apellido_paterno || ''}" placeholder="Apellido Paterno" required>
                <input type="text" class="edit-apellido-materno" value="${operador.apellido_materno || ''}" placeholder="Apellido Materno">
            </div>
            <div class="item-actions">
                <button class="edit" id="btn-edit-${operador.id}" onclick="habilitarEdicionOperador(${operador.id})">Editar</button>
                <button class="save" id="btn-save-${operador.id}" onclick="guardarEdicionOperador(${operador.id})" style="display: none;">Guardar</button>
                <button class="cancel" id="btn-cancel-${operador.id}" onclick="cancelarEdicionOperador(${operador.id})" style="display: none;">Cancelar</button>
                <button class="danger" onclick="eliminarOperador(${operador.id})">Eliminar</button>
            </div>
        `;
        operadoresAdminContent.appendChild(operadorItem);
    });
}

function popularSelectsOperadores(operadores) {
    const selects = [
        document.getElementById('unidadOperadorAsignar'),
        document.getElementById('otOperadorId'),
        document.getElementById('selectOperadorParaUnidad')
    ];

    selects.forEach(select => {
        select.innerHTML = '<option value="">-- Sin Asignar --</option>';
        operadores.forEach(operador => {
            const option = document.createElement('option');
            option.value = operador.id;
            option.textContent = `${operador.nombre} ${operador.apellido_paterno}`;
            select.appendChild(option);
        });
    });
}

function habilitarEdicionOperador(operadorId) {
    document.getElementById(`operador-info-${operadorId}`).style.display = 'none';
    document.getElementById(`operador-edit-form-${operadorId}`).style.display = 'flex';
    document.getElementById(`btn-edit-${operadorId}`).style.display = 'none';
    document.getElementById(`btn-save-${operadorId}`).style.display = 'inline-block';
    document.getElementById(`btn-cancel-${operadorId}`).style.display = 'inline-block';
}

function guardarEdicionOperador(operadorId) {
    const operadorItem = document.querySelector(`[data-operador-id='${operadorId}']`);
    if (!operadorItem) {
        alert("❌ Error: Elemento de operador no encontrado.");
        return;
    }
    const nuevoNombre = operadorItem.querySelector('.edit-nombre').value;
    const nuevoApellidoPaterno = operadorItem.querySelector('.edit-apellido-paterno').value;
    const nuevoApellidoMaterno = operadorItem.querySelector('.edit-apellido-materno').value;
    
    if (!nuevoNombre || !nuevoApellidoPaterno) {
        alert('El nombre y el apellido paterno son campos obligatorios.');
        return;
    }

    fetch(`operadores.php`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            id: operadorId,
            nombre: nuevoNombre, 
            apellido_paterno: nuevoApellidoPaterno, 
            apellido_materno: nuevoApellidoMaterno 
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            cargarOperadores();
        }
    })
    .catch(error => console.error('Error al editar operador:', error));
}

function cancelarEdicionOperador(operadorId) {
    document.getElementById(`operador-info-${operadorId}`).style.display = 'block';
    document.getElementById(`operador-edit-form-${operadorId}`).style.display = 'none';
    document.getElementById(`btn-edit-${operadorId}`).style.display = 'inline-block';
    document.getElementById(`btn-save-${operadorId}`).style.display = 'none';
    document.getElementById(`btn-cancel-${operadorId}`).style.display = 'none';
    cargarOperadores(); // Recargamos para restaurar los valores originales
}

function eliminarOperador(operadorId) {
    if (confirm(`¿Estás seguro de que quieres eliminar al operador con ID ${operadorId}?`)) {
        fetch(`operadores.php?id=${operadorId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.status === 'success') {
                cargarOperadores();
            }
        });
    }
}

// =========================================================================
// GESTIÓN DE ÓRDENES DE TRABAJO
// =========================================================================

async function crearOrdenDeTrabajo() {
    // Referencias a los elementos del formulario
    const otUnidadIdSelect = document.getElementById('otUnidadId');
    const otOperadorIdSelect = document.getElementById('otOperadorId');
    const otTipoMantenimientoInput = document.getElementById('otTipoMantenimiento');
    const otDescripcionTextarea = document.getElementById('otDescripcion');

    // Obtener los valores del formulario
    const unidadId = otUnidadIdSelect.value; // ¡Ya no se convierte a entero!
    const operadorId = otOperadorIdSelect.value;
    const tipoMantenimiento = otTipoMantenimientoInput.value.trim();
    const descripcion = otDescripcionTextarea.value.trim();

    // Validar que los campos obligatorios no estén vacíos
    if (!unidadId || !tipoMantenimiento || !descripcion) {
        alert("❌ Error: ID de unidad, tipo de mantenimiento y descripción son obligatorios.");
        return;
    }

    // Crear el objeto de datos para enviar
    const data = {
        unidad_id: unidadId, // Enviamos el ID de la unidad como string
        operador_id: operadorId ? parseInt(operadorId) : null,
        tipo_mantenimiento: tipoMantenimiento,
        descripcion: descripcion
    };

    // Enviar los datos al servidor usando la función sendData
    const response = await sendData(`${API_BASE_URL}ordenes_trabajo.php`, 'POST', data);

    if (response.status === 'success') {
        alert("✅ " + response.message);
        otUnidadIdSelect.value = '';
        otOperadorIdSelect.value = '';
        otTipoMantenimientoInput.value = '';
        otDescripcionTextarea.value = '';
    } else {
        alert("❌ Error: " + response.message);
    }
}

async function cargarOrdenesDeUnidad(unidadNumEconomico) {
    const ordenesTrabajoList = document.getElementById('ordenesTrabajoList');
    ordenesTrabajoList.innerHTML = ''; // Limpiamos la lista antes de cargar

    if (!unidadNumEconomico) {
        ordenesTrabajoList.innerHTML = '<div>Selecciona una unidad para ver sus órdenes.</div>';
        return;
    }

    try {
        // Corregimos la URL para que apunte al archivo correcto 'ordenes_trabajo.php'
        const response = await fetch(`${API_BASE_URL}ordenes_trabajo.php?unidad_id=${unidadNumEconomico}`);
        const data = await response.json();

        if (data.status === 'success') {
            mostrarOrdenesTrabajo(data.data);
        } else {
            console.error('Error al cargar órdenes de trabajo:', data.message);
            ordenesTrabajoList.innerHTML = `<div>Error al cargar órdenes: ${data.message}</div>`;
        }
    } catch (error) {
        console.error('Error en la petición de órdenes:', error);
        ordenesTrabajoList.innerHTML = `<div>Error de conexión. Revisa la consola.</div>`;
    }
}

function mostrarOrdenesTrabajo(ordenes) {
    const ordenesTrabajoList = document.getElementById('ordenesTrabajoList');
    ordenesTrabajoList.innerHTML = '';
    
    if (ordenes.length === 0) {
        ordenesTrabajoList.innerHTML = '<div>No hay órdenes de trabajo para esta unidad.</div>';
        return;
    }

    ordenes.forEach(orden => {
        const ordenItem = document.createElement('div');
        ordenItem.className = 'orden-item';
        let operadorInfo = 'N/A';
        if (orden.operador_nombre) {
            operadorInfo = `${orden.operador_nombre} ${orden.apellido_paterno || ''}`;
        }

        ordenItem.innerHTML = `
            <div>
                <strong>OT ID:</strong> ${orden.id}<br>
                <strong>Unidad:</strong> ${orden.num_economico} (Placas: ${orden.placas})<br>
                <strong>Operador que reporta:</strong> ${operadorInfo}<br>
                <strong>Tipo:</strong> ${orden.tipo_mantenimiento}<br>
                <strong>Descripción:</strong> ${orden.descripcion}<br>
                <strong>Fecha Inicio:</strong> ${orden.fecha_inicio}<br>
                <strong>Estado:</strong> ${orden.estado}<br>
                ${orden.fecha_fin ? `<strong>Fecha Fin:</strong> ${orden.fecha_fin}<br>` : ''}
            </div>
        `;
        ordenesTrabajoList.appendChild(ordenItem);
    });
}

// =========================================================================
// EVENTOS DE BOTONES
// =========================================================================

document.getElementById('btnAgregar').addEventListener('click', agregarUnidad);
document.getElementById('btnCompletar').addEventListener('click', completarMantenimiento);
document.getElementById('btnAsignar').addEventListener('click', asignarRuta);
document.getElementById('btnRegresarRuta').addEventListener('click', regresarDeRuta);
document.getElementById('btnEliminar').addEventListener('click', eliminarUnidad);

document.getElementById('btnAdministrar').addEventListener('click', () => {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('adminSection').style.display = 'block';
});

document.getElementById('btnVolverPrincipal').addEventListener('click', () => {
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('adminSection').style.display = 'none';
    cargarUnidades();
    cargarOperadores();
});

document.getElementById('btnGuardarOperador').addEventListener('click', () => {
    const nombre = document.getElementById('operadorNombre').value;
    const apPaterno = document.getElementById('operadorApellidoPaterno').value;
    const apMaterno = document.getElementById('operadorApellidoMaterno').value;

    fetch('operadores.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            action: 'agregar', 
            nombre: nombre, 
            apellido_paterno: apPaterno, 
            apellido_materno: apMaterno 
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            document.getElementById('operadorNombre').value = '';
            document.getElementById('operadorApellidoPaterno').value = '';
            document.getElementById('operadorApellidoMaterno').value = '';
            cargarOperadores();
        }
    });
});

document.getElementById('btnGuardarUnidadAdmin').addEventListener('click', () => {
    const numEconomico = document.getElementById('unidadNumEconomico').value;
    const placas = document.getElementById('unidadPlacas').value;
    const modelo = document.getElementById('unidadModelo').value;
    const marca = document.getElementById('unidadMarca').value;
    const operadorId = document.getElementById('unidadOperadorAsignar').value || null;
    
    fetch('unidades.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'agregar',
            num_economico: numEconomico,
            placas: placas,
            modelo: modelo,
            marca: marca,
            operador_id: operadorId,
            status: 'Lista para Asignación'
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            document.getElementById('unidadNumEconomico').value = '';
            document.getElementById('unidadPlacas').value = '';
            document.getElementById('unidadModelo').value = '';
            document.getElementById('unidadMarca').value = '';
            document.getElementById('unidadOperadorAsignar').value = '';
            cargarUnidades();
        }
    });
});

document.getElementById('btnAsignarOperadorAUnidad').addEventListener('click', () => {
    const numEconomico = document.getElementById('selectUnidadAsignarOperador').value;
    const operadorId = document.getElementById('selectOperadorParaUnidad').value || null;

    if (!numEconomico) {
        alert('Por favor, selecciona una unidad.');
        return;
    }
    
    fetch('unidades.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'asignar_operador',
            num_economico: numEconomico,
            operador_id: operadorId
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            cargarUnidades();
        }
    });
});


document.getElementById('btnCrearOrdenTrabajo').addEventListener('click', crearOrdenDeTrabajo);

document.getElementById('btnVerOrdenesUnidad').addEventListener('click', () => {
    const unidadNumEconomico = document.getElementById('selectUnidadVerOT').value;
    if (unidadNumEconomico) {
        cargarOrdenesDeUnidad(unidadNumEconomico);
    } else {
        alert('Por favor, selecciona una unidad para ver sus órdenes de trabajo.');
    }
});