const express = require('express');
const mysql = require('mysql2'); 
const bcrypt = require('bcryptjs'); 
const session = require('express-session'); // Para recordar logins
const path = require('path'); // Para manejar rutas de archivos y carpetas

const app = express();
const puerto = 3000;

// ==========================================
// 1. CONFIGURACIÓN DEL FRONTEND Y SESIONES
// ==========================================
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false })); 
app.use(express.json());

// Configuramos la caja fuerte de las sesiones
app.use(session({
  secret: 'clave_super_secreta_tfg_banda', // Contraseña para cifrar la memoria del servidor
  resave: false,
  saveUninitialized: false
}));

// ==========================================
// 2. CONFIGURACIÓN DE LA BASE DE DATOS
// ==========================================
const db = mysql.createConnection({
  host: 'db',
  user: 'root',
  password: 'rootpassword',
  database: 'banda_db'
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('¡Conexión exitosa a la base de datos MySQL! 💾✨');
});

// ==========================================
// 3. RUTAS DE LA APLICACIÓN
// ==========================================

// --- RUTA DE LOGIN (Con cruce de caminos para el Admin) ---
app.post('/api/login', (req, res) => {
  const emailIngresado = req.body.email;
  const passwordIngresada = req.body.password;

  const sqlBuscar = 'SELECT * FROM usuarios WHERE email = ?';
  
  db.query(sqlBuscar, [emailIngresado], async (err, resultados) => {
    if (err) return res.send('Error en el servidor al intentar hacer login.');
    if (resultados.length === 0) return res.send('No existe ningún músico con este correo ❌');

    const usuarioEncontrado = resultados[0];
    const passwordCorrecta = await bcrypt.compare(passwordIngresada, usuarioEncontrado.password_hash);

    if (passwordCorrecta) {
      // Guardamos en la memoria del servidor quién ha entrado
      req.session.logueado = true;
      req.session.email = usuarioEncontrado.email;
      
      // --- ¡EL CRUCE DE CAMINOS! ---
      if (usuarioEncontrado.email === 'carlita@banda.com') {
        // Si eres la jefa (Admin), vas directa a tu panel protegido
        res.redirect('/crear-evento');
      } else {
        // Si es un músico normal, va a la cartelera pública de eventos
        res.redirect('/eventos.html');
      }
      
    } else {
      res.send('Contraseña incorrecta ❌');
    }
  });
});

// --- RUTA PROTEGIDA: Solo para ver el formulario de crear evento ---
app.get('/crear-evento', (req, res) => {
  // Comprobamos si hay sesión iniciada Y si el correo es el tuyo
  if (req.session.logueado && req.session.email === 'carlita@banda.com') {
    // Te enviamos el archivo desde la carpeta secreta 'privado'
    res.sendFile(path.join(__dirname, 'privado', 'crear-evento.html'));
  } else {
    // Si intentan colarse, bloqueamos el paso
    res.send(`
      <div style="text-align: center; margin-top: 50px; font-family: sans-serif;">
        <h1>Acceso Denegado ❌</h1>
        <p>Solo la administración de la agrupación puede entrar aquí.</p>
        <a href="/eventos.html">Volver a los eventos</a>
      </div>
    `);
  }
});

// --- RUTA PROTEGIDA: Guardar el evento en MySQL (Uso exclusivo de Admin) ---
app.post('/api/crear-evento', (req, res) => {
  // Doble capa de seguridad para evitar inyecciones directas
  if (!req.session.logueado || req.session.email !== 'carlita@banda.com') {
    return res.send('Acceso denegado. No tienes permisos para publicar en la base de datos.');
  }

  const { titulo, fecha_hora, tipo_evento, lugar } = req.body;
  const sqlInsertar = `INSERT INTO eventos (titulo, fecha_hora, tipo_evento, lugar) VALUES (?, ?, ?, ?)`;

  db.query(sqlInsertar, [titulo, fecha_hora, tipo_evento, lugar], (err, resultado) => {
    if (err) return res.send('Error al crear el evento ❌');
    // Tras guardarlo bien, te llevamos a ver cómo ha quedado publicado
    res.redirect('/eventos.html');
  });
});

// --- RUTA PÚBLICA: Obtener los eventos (Para que los músicos los vean) ---
app.get('/api/eventos', (req, res) => {
  const sqlBuscar = 'SELECT * FROM eventos ORDER BY fecha_hora ASC';
  db.query(sqlBuscar, (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error al obtener eventos' });
    res.json(resultados);
  });
});

// ==========================================
// 4. ENCENDIDO DEL SERVIDOR
// ==========================================
app.listen(puerto, () => {
  console.log(`Servidor de la banda escuchando en el puerto ${puerto} 🎺🚀`);
});