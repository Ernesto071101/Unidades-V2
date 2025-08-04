// taller.js

// Almacena la lista de operadores para facilitar la edición
let operadores = [];

// Funciones para cargar datos al inicio
document.addEventListener('DOMContentLoaded', () => {
    cargarUnidades();
    cargarOperadores();
});

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
    if (!unidadId) return;

    fetch('unidades.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            action: 'regresar_ruta', 
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

function crearOrdenTrabajo() {
    const otUnidadId = document.getElementById('otUnidadId').value;
    const otOperadorId = document.getElementById('otOperadorId').value;
    const otTipoMantenimiento = document.getElementById('otTipoMantenimiento').value;
    const otDescripcion = document.getElementById('otDescripcion').value;

    if (!otUnidadId || !otTipoMantenimiento || !otDescripcion) {
        alert('Por favor, complete los campos de unidad, tipo y descripción.');
        return;
    }

    fetch('ordenes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'crear',
            unidad_id: otUnidadId,
            operador_id: otOperadorId || null,
            tipo_mantenimiento: otTipoMantenimiento,
            descripcion: otDescripcion,
            fecha_inicio: new Date().toISOString().slice(0, 10)
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.status === 'success') {
            document.getElementById('otTipoMantenimiento').value = '';
            document.getElementById('otDescripcion').value = '';
            cargarOrdenesDeUnidad(otUnidadId);
        }
    });
}

function cargarOrdenesDeUnidad(unidadNumEconomico) {
    const ordenesTrabajoList = document.getElementById('ordenesTrabajoList');
    ordenesTrabajoList.innerHTML = '';
    
    fetch(`ordenes.php?unidad_id=${unidadNumEconomico}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                mostrarOrdenesTrabajo(data.data);
            } else {
                console.error('Error al cargar órdenes de trabajo:', data.message);
            }
        });
}

function mostrarOrdenesTrabajo(ordenes) {
    const ordenesTrabajoList = document.getElementById('ordenesTrabajoList');
    if (ordenes.length === 0) {
        ordenesTrabajoList.innerHTML = '<div>No hay órdenes de trabajo para esta unidad.</div>';
        return;
    }
    ordenes.forEach(orden => {
        const ordenItem = document.createElement('div');
        ordenItem.className = 'orden-item';
        ordenItem.innerHTML = `
            <div>
                <strong>OT #${orden.id}</strong> - Tipo: ${orden.tipo_mantenimiento}<br>
                Descripción: ${orden.descripcion}<br>
                Estado: ${orden.estado}<br>
                Fecha de Inicio: ${orden.fecha_inicio}
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

document.getElementById('btnCrearOrdenTrabajo').addEventListener('click', crearOrdenTrabajo);

document.getElementById('btnVerOrdenesUnidad').addEventListener('click', () => {
    const unidadNumEconomico = document.getElementById('selectUnidadVerOT').value;
    if (unidadNumEconomico) {
        cargarOrdenesDeUnidad(unidadNumEconomico);
    } else {
        alert('Por favor, selecciona una unidad para ver sus órdenes de trabajo.');
    }
});