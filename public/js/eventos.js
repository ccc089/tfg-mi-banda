/*=============== GESTIÓN DINÁMICA DE EVENTOS Y ASISTENCIA ===============*/
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Comprobar si somos la Admin para mostrar el botón oculto
    fetch('/api/check-admin')
        .then(res => res.json())
        .then(data => {
            if(data.isAdmin) {
                const navAdmin = document.getElementById('nav-admin');
                if(navAdmin) navAdmin.style.display = 'block'; // ¡Se hizo la luz!
            }
        })
        .catch(err => console.error('Error verificando admin', err));

    // 2. Cargar los eventos y dibujar las tarjetas
    const contenedorEventos = document.getElementById('contenedor-eventos');

    if(contenedorEventos) {
        fetch('/api/eventos')
            .then(respuesta => {
                if (!respuesta.ok) {
                    window.location.href = '/login.html';
                    throw new Error('No logueado');
                }
                return respuesta.json();
            })
            .then(eventos => {
                contenedorEventos.innerHTML = '';

                eventos.forEach(evento => {
                    const fechaObj = new Date(evento.fecha_hora);
                    const fechaBonita = fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
                    const horaBonita = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute:'2-digit' });
                    const claseBadge = evento.tipo_evento.toLowerCase() === 'ensayo' ? 'ensayo' : 'actuacion';
                    
                    // Comprobamos qué estado nos manda la base de datos (si no hay, es 'pendiente')
                    const estadoActual = (evento.estado_asistencia || 'pendiente').toLowerCase();

                    const tarjetaHTML = `
                        <article class="eventos__card">
                            <div class="eventos__header">
                                <h3 class="eventos__title">${evento.titulo}</h3>
                                <span class="eventos__badge ${claseBadge}">${evento.tipo_evento}</span>
                            </div>
                            <div class="eventos__info">
                                <p><i class="ri-calendar-event-line"></i> ${fechaBonita}</p>
                                <p><i class="ri-time-line"></i> ${horaBonita}h</p>
                                <p><i class="ri-map-pin-line"></i> ${evento.lugar}</p>
                            </div>
                            
                            <div class="eventos__rsvp">
                                <label class="eventos__label">Asistencia:</label>
                                <select class="eventos__select asistencia-select" data-id="${evento.id_evento}">
                                    <option value="pendiente" ${estadoActual === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                                    <option value="voy" ${estadoActual === 'voy' ? 'selected' : ''}>✅ Voy</option>
                                    <option value="no-voy" ${estadoActual === 'no-voy' ? 'selected' : ''}>❌ No voy</option>
                                    <option value="tarde" ${estadoActual === 'tarde' ? 'selected' : ''}>⏳ Llego tarde</option>
                                </select>
                            </div>
                        </article>
                    `;
                    contenedorEventos.innerHTML += tarjetaHTML;
                });

                // 3. Activar el guardado automático al cambiar el desplegable
                document.querySelectorAll('.asistencia-select').forEach(select => {
                    select.addEventListener('change', (e) => {
                        const idEvento = e.target.getAttribute('data-id');
                        const nuevoEstado = e.target.value;

                        // Disparamos la petición silenciosa al backend
                        fetch('/api/asistencia', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id_evento: idEvento, estado: nuevoEstado })
                        })
                        .then(res => res.text())
                        .then(mensaje => console.log('Servidor dice:', mensaje))
                        .catch(error => console.error('Error:', error));
                    });
                });
            })
            .catch(error => console.error('Error al cargar eventos:', error));
    }
});

/* Funciones de Modales (Las dejamos como estaban) */
function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.add('active-modal');
}
function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.remove('active-modal');
}
document.addEventListener('click', (e) => {
    if(e.target.classList.contains('modal')) e.target.classList.remove('active-modal');
});