/*=============== CARGAR DATOS DEL PERFIL DESDE EL BACKEND ===============*/
document.addEventListener('DOMContentLoaded', () => {
    
    // Llamamos a nuestra nueva ruta secreta
    fetch('/api/perfil')
        .then(respuesta => {
            // Si el servidor nos dice que no estamos logueados (401), nos echa al login
            if (!respuesta.ok) {
                window.location.href = '/login.html';
                throw new Error('Usuario no logueado');
            }
            return respuesta.json();
        })
        .then(datos => {
            // Buscamos las etiquetas en el HTML por su ID y les inyectamos el texto
            document.getElementById('nombre-usuario').textContent = datos.nombreCompleto;
            document.getElementById('inst-usuario').textContent = datos.instrumento;
            document.getElementById('talla-usuario').textContent = datos.talla;
            
            // Animamos los contadores poniéndoles el número real
            document.getElementById('count-ensayos').textContent = datos.ensayos;
            document.getElementById('count-conciertos').textContent = datos.actuaciones;
        })
        .catch(error => console.error('Error:', error));
});