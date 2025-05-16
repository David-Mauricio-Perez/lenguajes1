// index.js
// ... (documentación anterior) ...
// Modificado para usar persistencia en archivo JSON cuando se ejecuta con Node.js

import { Estudiante } from "./Estudiante.js";
import { Curso } from "./Curso.js";
import fs from 'fs/promises'; // Para operaciones de archivo asíncronas
import path from 'path'; // Para construir rutas de archivo de forma segura

console.log(
  "--- Simulador de Notas Estudiantiles (con persistencia en archivo JSON) ---"
);

// __dirname no está disponible directamente en ES Modules, así que usamos import.meta.url
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE_PATH = path.join(__dirname, 'datosDelCurso.json'); // Ruta al archivo JSON

/**
 * @function guardarCurso
 * @description Serializa el objeto curso a JSON y lo guarda en un archivo.
 * @param {Curso} curso - La instancia del curso a guardar.
 */
async function guardarCurso(curso) {
  try {
    const cursoJSON = JSON.stringify(curso.toJSON(), null, 2); // Usar toJSON y formatear
    await fs.writeFile(DATA_FILE_PATH, cursoJSON, 'utf-8');
    console.log(`Curso "${curso.nombreCurso}" guardado en ${DATA_FILE_PATH}.`);
  } catch (error) {
    console.error(`Error al guardar el curso en ${DATA_FILE_PATH}:`, error);
  }
}

/**
 * @function cargarCurso
 * @description Carga la cadena JSON desde un archivo y la deserializa a una instancia de Curso.
 * @returns {Promise<Curso|null>} La instancia del curso recuperada o null si no hay datos o hay error.
 */
async function cargarCurso() {
  try {
    const cursoJSON = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const cursoData = JSON.parse(cursoJSON);
    const cursoRecuperado = Curso.fromJSON(cursoData);
    console.log(
      `Curso "${cursoRecuperado.nombreCurso}" cargado desde ${DATA_FILE_PATH}.`
    );
    return cursoRecuperado;
  } catch (error) {
    if (error.code === 'ENOENT') { // ENOENT = Error NO ENTry (file not found)
      console.log(`No se encontró el archivo de datos: ${DATA_FILE_PATH}. Se creará uno nuevo si es necesario.`);
    } else {
      console.error(`Error al cargar el curso desde ${DATA_FILE_PATH}:`, error);
    }
    return null;
  }
}

// --- Lógica Principal ---
async function main() {
  let cursoIngSoftware;

  // 1. Intentar cargar el curso desde el archivo JSON
  cursoIngSoftware = await cargarCurso();

  // 2. Si no se cargó, crear uno nuevo con datos de prueba
  if (!cursoIngSoftware) {
    console.log("Creando un nuevo curso con datos de prueba...");
    cursoIngSoftware = new Curso("Introducción a la Ingeniería de Software", 70);

    const estudiante1 = new Estudiante("S001", "Ana Pérez", [80, 90, 75, 85]);
    const estudiante2 = new Estudiante("S002", "Luis Gómez", [50, 65, 55, 60]);
    const estudiante3 = new Estudiante("S003", "Clara Kent", [95, 92, 98]);
    const estudiante4 = new Estudiante("S004", "Pedro Paramo", [60, 70, 65]);

    cursoIngSoftware.agregarEstudiante(estudiante1);
    cursoIngSoftware.agregarEstudiante(estudiante2);
    cursoIngSoftware.agregarEstudiante(estudiante3);
    cursoIngSoftware.agregarEstudiante(estudiante4);

    // Guardar el curso recién creado en el archivo JSON
    await guardarCurso(cursoIngSoftware);
  }

  // 3. Mostrar resultados del curso (cargado o recién creado)
  if (cursoIngSoftware) {
    cursoIngSoftware.mostrarResultados();

    // Ejemplo de modificación y guardado:
    // const nuevoEstudiante = new Estudiante('S005', 'Maria Sol', [88, 92]);
    // cursoIngSoftware.agregarEstudiante(nuevoEstudiante);
    // console.log("\n--- Después de agregar a Maria Sol ---");
    // cursoIngSoftware.mostrarResultados();
    // await guardarCurso(cursoIngSoftware); // Volver a guardar después de la modificación
  } else {
    console.error("No se pudo cargar ni crear el curso.");
  }

  // Para limpiar el archivo para la próxima ejecución (opcional, para pruebas):
  // try {
  //   await fs.unlink(DATA_FILE_PATH);
  //   console.log(`Archivo ${DATA_FILE_PATH} eliminado para la próxima prueba.`);
  // } catch (err) {
  //   if (err.code !== 'ENOENT') console.error("Error al eliminar el archivo de datos:", err);
  // }
}

// Ejecutar la función principal
main().catch(err => {
  console.error("Error en la ejecución principal:", err);
});