# Bandmate - Plataforma Integral de Gestión y Control Operativo de Agrupaciones Musicales 🎺🚀

**Bandmate** es una aplicación web dinámica diseñada específicamente para centralizar, optimizar y automatizar la gestión logística, de eventos y administrativa de asociaciones culturales y bandas de música. Este proyecto constituye el núcleo técnico del **Trabajo de Fin de Grado (TFG)** para la titulación en Ingeniería Informática.

La arquitectura del sistema se basa en el paradigma de **microservicios conteneurizados**, aislando la lógica de negocio del motor de persistencia relacional. Este enfoque garantiza la portabilidad absoluta del entorno de desarrollo, una escalabilidad transparente frente al crecimiento de usuarios y un despliegue homogéneo e independiente del sistema operativo anfitrión.

---

## 🏗️ Arquitectura de la Infraestructura y Red Virtual

El ecosistema de Bandmate está orquestado mediante **Docker Compose**, instanciando dos contenedores que operan en un puente de red virtual privado, inaccesible de forma directa desde el exterior salvo por los puertos explícitamente expuestos:

1.  **Contenedor del Backend (`banda_node`):**
    * **Entorno:** Node.js de soporte a largo plazo (LTS).
    * **Framework:** Express.js enfocado a una arquitectura REST.
    * **Responsabilidad:** Procesamiento de lógica de negocio, control de rutas dinámicas, autenticación criptográfica de sesiones y capa perimetral activa de ciberseguridad.
    * **Puerto Expuesto:** `3000:3000` (Enlace de la interfaz web con el Host local).
2.  **Contenedor de la Base de Datos (`banda_mysql`):**
    * **Motor:** MySQL Server 5.7 (Selección estratégica para garantizar máxima compatibilidad y estabilidad en hipervisores y emulaciones de CPU clásicas como x86-64-v1).
    * **Responsabilidad:** Persistencia de datos mediante un esquema fuertemente acoplado (Restricciones de Integridad Referencial y Claves Foráneas).
    * **Persistencia Física:** Uso de *Docker Volumes* vinculados al almacenamiento del Host, impidiendo la pérdida de información al reiniciar o destruir el contenedor.
    * **Puerto Interno:** `3306` (Aislado y accesible únicamente por el contenedor de Node.js a través de la red nativa de Docker).

```text
                      [ DISPOSITIVO DEL USUARIO ]
                      (Navegador Web / Móvil / PC)
                                  |
                                  | Peticiones HTTP/REST (JSON)
                                  | Archivos Estáticos (HTML, CSS, JS)
                                  v
+=============================================================================+
|                      SERVIDOR HOST (Máquina Virtual)                        |
|                                                                             |
|       +-------------------------------------------------------------+       |
|       |                    RED VIRTUAL DOCKER                       |       |
|       |                                                             |       |
|       |   +-----------------------+         +-------------------+   |       |
|       |   |  CONTENEDOR APP       |         |  CONTENEDOR DB    |   |       |
|       |   |  (Node.js / Express)  |         |  (MySQL 5.7)      |   |       |
|       |   +-----------------------+         +-------------------+   |       |
|       |   |                       |         |                   |   |       |
|       |   | [ Middlewares ]       |         | [ Base de Datos ] |   |       |
|       |   | - express-rate-limit  |         | - banda_db        |   |       |
|       |   | - express-session     |         |                   |   |       |
|       |   |                       | <=====> | [ Tablas ]        |   |       |
|       |   | [ Núcleo (index.js) ] |  Red    | - usuarios        |   |       |
|       |   | - Enrutador API       | Interna | - eventos         |   |       |
|       |   | - Bcryptjs (Cifrado)  |  TCP    | - asistencias     |   |       |
|       |   |                       |  3306   | - instrumentos    |   |       |
|       |   | [ Vistas (Public) ]   |         | - inventario_ropa |   |       |
|       |   | - eventos.html        |         |                   |   |       |
|       |   | - perfil.html         |         | [ Persistencia ]  |   |       |
|       |   | - privado/crear...    |         | - Docker Volumes  |   |       |
|       |   +-----------------------+         +-------------------+   |       |
|       +-------------------------------------------------------------+       |
+=============================================================================+

## 🛠️ Requisitos Previos del Sistema

Para el correcto despliegue e inicialización del stack tecnológico, el entorno de ejecución anfitrión debe contar con las siguientes herramientas instaladas y configuradas en sus variables de entorno del sistema:

* **Docker Engine:** Versión 20.10.0 o superior.
* **Docker Compose:** Soporte de sintaxis para esquemas v3.3 o superiores.
* **Intérprete del Sistema (Host):** Linux Ubuntu Server/Desktop (Entorno nativo de validación de este proyecto), macOS o Windows con WSL2 activo.
* **Conexión a Red:** Requerida en la primera inicialización para la descarga automática de dependencias y empaquetado de imágenes desde Docker Hub.

---

## 🔧 Guía de Despliegue y Puesta en Marcha (Paso a Paso)

Siga las siguientes instrucciones de comandos de forma secuencial en su consola para compilar, enlazar y ejecutar la infraestructura de Bandmate:

### 1. Ubicación en el Directorio del Proyecto
Abra el intérprete de comandos de su sistema operativo y acceda a la carpeta raíz donde se aloja el archivo maestro `docker-compose.yml` y el núcleo del backend:
```bash
cd mi-banda-tfg
```

### 2. Sincronización e Instalación de Librerías Perimetrales
Antes de inyectar el código al ecosistema virtual, asegúrese de que el gestor de paquetes de Node ha descargado todos los módulos requeridos (incluyendo las librerías añadidas de ciberseguridad como `express-rate-limit`):
```bash
npm install
```

### 3. Lanzamiento del Entorno Conteneurizado
Ordene al motor de orquestación de Docker que interprete el archivo de configuración estructural y levante los servicios en segundo plano (modo desatendido o *detached*):
Antes tendras que hacer un cd y meterte en la carpeta donde esta el proyecto.
```bash
sudo docker-compose up -d
```
*El sistema descargará el entorno estandarizado de Node y la imagen relacional de MySQL, configurará el almacenamiento lógico persistente y enlazará las IPs internas en la red virtual automáticamente.*
```bash
docker exec -it banda_node bash
```
*Y luego se ejecutara el siguiente comando*
```bash
npx nodemon index.js
```

## ⚠️ Registro de Errores Críticos de Despliegue (Troubleshooting)

### 1. Carrera de Velocidad en el Arranque en Frío (`PROTOCOL_CONNECTION_LOST`)
* **Síntoma:** Al levantar el servidor por primera vez en el día, al entrar al navegador la web muestra el error *"La conexión ha sido reiniciada"* y el log del backend arroja una excepción fatal de tipo `PROTOCOL_CONNECTION_LOST` deteniendo la ejecución de Node.js.
* **Causa Raíz:** Node.js arranca de forma casi instantánea, mientras que el motor de MySQL requiere varios segundos para verificar su almacenamiento lógico e inicializar sus sockets de comunicación interna. El backend intenta conectarse a un puerto que aún está apagado y se rinde.
* **Resolución Ejecutada:** Como MySQL ya habrá completado su inicio definitivo mientras leías el error, simplemente fuerce un reinicio en caliente exclusivo del contenedor de aplicaciones para que reintente el apretón de manos (*handshake*):
    ```bash
    sudo docker-compose restart banda_node
    ```

### 2. Error de Sintaxis de la Versión del Compose (`version is unsupported`)
* **Síntoma:** Al lanzar comandos de Docker, el intérprete aborta el flujo alegando que no comprende la especificación de versión declarada en la cabecera.
* **Resolución Ejecutada:** El entorno local del servidor cuenta con un intérprete clásico de compose estable. Se solventó degradando la etiqueta inicial del esquema de configuración de la versión avanzada `3.8` a la versión estandarizada `3.3`, manteniendo intacta toda la lógica funcional.

### 3. Excepción de Compatibilidad de Arquitectura de Hardware de la CPU (`x86-64-v2`)
* **Síntoma:** Al descargar versiones modernas de MySQL (como MySQL 8.0), el contenedor cae en un bucle infinito de reinicios inesperados arrojando el error fatal `Fatal glibc error: CPU does not support x86-64-v2`.
* **Resolución Ejecutada:** Las tecnologías de virtualización modernas optimizan ciertas instrucciones binarias que microprocesadores antiguos no integran de forma nativa. Para garantizar un despliegue universal e inmune al hardware, se realizó un downgrade estratégico hacia la versión estable `mysql:5.7` en el script del Compose, manteniendo al 100% las capacidades relacionales requeridas por el software.

---

## 🔒 Capa de Blindaje y Ciberseguridad (Estándar OWASP)

Para transformar la plataforma en una solución robusta apta para un entorno de producción real, se implementaron defensas activas contra los vectores de explotación más dañinos del desarrollo web:

1.  **Protección contra Ataques de Inyección SQL (SQLi):**
    Queda terminantemente prohibida la concatenación directa de inputs del usuario en strings de comandos de base de datos. El 100% de las transacciones hacia MySQL utilizan **Consultas Parametrizadas (Placeholders `?`)**. El driver nativo trata los datos introducidos estrictamente como texto literal plano y nunca como código SQL ejecutable, anulando ataques de bypass de autenticación (ej: `' OR '1'='1`).
2.  **Mitigación de Ataques de Fuerza Bruta (Fail2Ban por Middleware):**
    Para impedir que bots maliciosos prueben miles de contraseñas por segundo en la pantalla de login, se integró el middleware `express-rate-limit`. Este módulo monitoriza las peticiones entrantes rastreando la IP de origen. Si una misma IP acumula **5 fallos consecutivos de inicio de sesión**, la ruta bloquea por completo esa IP durante una ventana de castigo de **15 minutos**, devolviendo un mensaje explícito de advertencia de seguridad y liberando de carga computacional a la base de datos.
3.  **Criptografía Avanzada en Persistencia:**
    El sistema no tiene conocimiento de las contraseñas reales de los usuarios. En su lugar, el backend utiliza el algoritmo criptográfico de hashing unidireccional **Bcrypt** con un factor de coste adaptativo de `10 rounds (salt)`. Las contraseñas se almacenan en MySQL como firmas alfanuméricas irreversibles, haciendo inútil cualquier ataque de exfiltración de datos.

## 🖥️ Acceso a la Aplicación

Una vez que ambos servicios muestren el estado `done` en verde, la plataforma estará 100% disponible. Abre tu navegador web e introduce los siguientes endpoints de acceso local:

* **Portal de Acceso General:** `http://localhost:3000/login.html`
* **Panel Privado de Administración (Admin):** `http://localhost:3000/crear-evento` *(Restringido mediante variables de sesión)*.

### Credenciales de Prueba por Defecto:

* **Rol Administración (Jefa/Admin):** * *Email:* `carlita@banda.com`
  * *Password:* `123456`

* **Rol Músico Estándar (Miembro):**
  * *Email:* `usuario@banda.com`
  * *Password:* `123456`

## 📊 Panel de Comandos de Control Operativo

Utilice estos comandos desde la terminal en el directorio raíz para gestionar el estado de fondo de su servidor web:

* **Ver el flujo de la consola o depurar errores en vivo:**
    ```bash
    sudo docker-compose logs -f banda_node
    ```
* **Detener la ejecución de la app de forma segura salvando recursos:**
    ```bash
    sudo docker-compose stop
    ```
* **Desmontar la infraestructura y limpiar las interfaces de red internas:**
    ```bash
    sudo docker-compose down
    ```
* **Ejecución manual interactiva en primer plano (Modo Debug):**
    ```bash
    npx nodemon index.js
    ```
