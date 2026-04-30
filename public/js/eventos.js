/*=============== MODAL EVENTOS ===============*/

// Función para abrir la ventana
function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.classList.add('active-modal');
    }
}

// Función para cerrar la ventana
function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.classList.remove('active-modal');
    }
}

// Cerrar la ventana si haces clic fuera de la caja negra
document.addEventListener('click', (e) => {
    if(e.target.classList.contains('modal')) {
        e.target.classList.remove('active-modal');
    }
});

/*=============== CARGAR EVENTOS DINÁMICOS DESDE MYSQL ===============*/
document.addEventListener('DOMContentLoaded', () => {
    const contenedorEventos = document.getElementById('contenedor-eventos');

    if(contenedorEventos) {
        // Llamamos a la ruta que creamos en Node.js
        fetch('/api/eventos')
            .then(respuesta => respuesta.json())
            .then(eventos => {
                // Limpiamos el contenedor
                contenedorEventos.innerHTML = '';

                // Por cada evento que venga de MySQL, creamos una tarjeta HTML
                eventos.forEach(evento => {
                    // Formateamos la fecha para que se vea bonita
                    const fechaObj = new Date(evento.fecha_hora);
                    const fechaBonita = fechaObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
                    const horaBonita = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute:'2-digit' });

                    // Elegimos la clase CSS del badge dependiendo si es ensayo o actuación
                    const claseBadge = evento.tipo_evento.toLowerCase() === 'ensayo' ? 'ensayo' : 'actuacion';

                    // Creamos el HTML de la tarjeta
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
                                <select class="eventos__select">
                                    <option value="pendiente" selected>Pendiente</option>
                                    <option value="voy">✅ Voy</option>
                                    <option value="no-voy">❌ No voy</option>
                                    <option value="tarde">⏳ Llego tarde</option>
                                </select>
                            </div>
                        </article>
                    `;

                    // Lo insertamos en la página
                    contenedorEventos.innerHTML += tarjetaHTML;
                });
            })
            .catch(error => console.error('Error al cargar eventos:', error));
    }
});