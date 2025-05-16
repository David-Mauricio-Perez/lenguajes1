// index.js
// Simulador de Notas Estudiantiles Interactivo
// Utiliza persistencia en archivo JSON.

import { Estudiante } from "./Estudiante.js";
import { Curso } from "./Curso.js";
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline'; // Para entrada de usuario

// --- Configuración Inicial ---
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE_PATH = path.join(__dirname, 'datosDelCurso.json');

// Instancia de readline para entrada/salida
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función para hacer preguntas y obtener respuestas (promisificada)
function preguntar(pregunta) {
    return new Promise(resolve => rl.question(pregunta, resolve));
}

// --- Funciones de Persistencia (sin cambios) ---
async function guardarCurso(curso) {
    try {
        const cursoJSON = JSON.stringify(curso.toJSON(), null, 2);
        await fs.writeFile(DATA_FILE_PATH, cursoJSON, 'utf-8');
        console.log(`\n✅ Curso "${curso.nombreCurso}" guardado en ${DATA_FILE_PATH}.`);
    } catch (error) {
        console.error(`\n❌ Error al guardar el curso en ${DATA_FILE_PATH}:`, error);
    }
}

async function cargarCurso() {
    try {
        const cursoJSON = await fs.readFile(DATA_FILE_PATH, 'utf-8');
        const cursoData = JSON.parse(cursoJSON);
        const cursoRecuperado = Curso.fromJSON(cursoData);
        console.log(`\n✅ Curso "${cursoRecuperado.nombreCurso}" cargado desde ${DATA_FILE_PATH}.`);
        return cursoRecuperado;
    } catch (error) {
        if (error.code === 'ENOENT') {
            // No se muestra mensaje aquí, se manejará en la lógica de inicialización
        } else {
            console.error(`\n❌ Error al cargar el curso desde ${DATA_FILE_PATH}:`, error);
        }
        return null;
    }
}

// --- Funciones para Datos de Prueba ---
function crearDatosDePrueba(curso) {
    console.log("\nℹ️ Cargando datos de prueba...");
    const estudiante1 = new Estudiante("S001", "Ana Pérez", [80, 90, 75, 85]);
    const estudiante2 = new Estudiante("S002", "Luis Gómez", [50, 65, 55, 60]);
    const estudiante3 = new Estudiante("S003", "Clara Kent", [95, 92, 98]);
    const estudiante4 = new Estudiante("S004", "Pedro Paramo", [60, 70, 65]);

    curso.agregarEstudiante(estudiante1);
    curso.agregarEstudiante(estudiante2);
    curso.agregarEstudiante(estudiante3);
    curso.agregarEstudiante(estudiante4);
    console.log("👍 Datos de prueba cargados.");
}

// --- Funciones del Menú ---

async function opcionCrearEstudiante(curso) {
    console.log("\n--- Crear Nuevo Estudiante ---");
    const id = await preguntar("Ingrese ID del estudiante: ");
    const nombre = await preguntar("Ingrese nombre del estudiante: ");
    // Ya no se piden calificaciones aquí
    if (id && nombre) {
        const nuevoEstudiante = new Estudiante(id, nombre, []);
        curso.agregarEstudiante(nuevoEstudiante);
        console.log(`\n👍 Estudiante "${nombre}" agregado al curso.`);
        await guardarCurso(curso); // Guardar después de agregar
    } else {
        console.log("\n⚠️ ID y Nombre son obligatorios. No se agregó el estudiante.");
    }
}

// [2] Agregar nota de estudiante
async function opcionAgregarNotaEstudiante(curso) {
    if (curso.estudiantes.length === 0) {
        console.log("ℹ️ No hay estudiantes en el curso.");
        return;
    }
    console.log("\n--- Agregar Nota de Estudiante ---");
    const id = await preguntar("Ingrese el ID del estudiante: ");
    const estudiante = curso.estudiantes.find(e => e.id === id);
    if (!estudiante) {
        console.log("⚠️ No se encontró un estudiante con ese ID.");
        return;
    }

    while (true) {
        const califStr = await preguntar("Ingrese calificación (o escriba 'fin' para terminar): ");
        if (califStr.trim().toLowerCase() === 'fin') break;
        const califNum = parseFloat(califStr);
        if (!isNaN(califNum)) {
            estudiante.agregarCalificacion(califNum);
            console.log(`👍 Calificación agregada a ${estudiante.nombre}.`);
        } else {
            console.log("⚠️ Calificación inválida.");
        }
    }
    await guardarCurso(curso);
}

// [3] Consultar promedio por estudiante
async function opcionConsultarPromedioEstudiante(curso) {
    if (curso.estudiantes.length === 0) {
        console.log("ℹ️ No hay estudiantes en el curso.");
        return;
    }
    const id = await preguntar("Ingrese el ID del estudiante: ");
    const estudiante = curso.estudiantes.find(e => e.id === id);
    if (!estudiante) {
        console.log("⚠️ No se encontró un estudiante con ese ID.");
        return;
    }
    console.log(`Promedio de ${estudiante.nombre}: ${estudiante.calcularPromedio().toFixed(2)}`);
}

function opcionMostrarPromedios(curso) {
    console.log("\n--- Promedios ---");
    if (curso.estudiantes.length === 0) {
        console.log("ℹ️ No hay estudiantes en el curso para calcular promedios.");
        return;
    }

    console.log("Promedios Individuales:");
    curso.estudiantes.forEach(est => {
        console.log(`  - ${est.nombre}: ${est.calcularPromedio().toFixed(2)}`);
    });
    console.log(`\nPromedio General del Curso: ${curso.calcularPromedioGeneral().toFixed(2)}`);
}

// [4] Ver lista de aprobados
function opcionVerAprobados(curso) {
    const aprobados = curso.obtenerAprobados();
    console.log("\n--- Estudiantes Aprobados ---");
    if (aprobados.length === 0) {
        console.log("ℹ️ Ningún estudiante aprobado.");
    } else {
        aprobados.forEach(est => {
            console.log(`- ${est.nombre} (Promedio: ${est.calcularPromedio().toFixed(2)})`);
        });
    }
}

// [5] Ver lista de reprobados
function opcionVerReprobados(curso) {
    const reprobados = curso.obtenerReprobados();
    console.log("\n--- Estudiantes Reprobados ---");
    if (reprobados.length === 0) {
        console.log("ℹ️ Ningún estudiante reprobado.");
    } else {
        reprobados.forEach(est => {
            console.log(`- ${est.nombre} (Promedio: ${est.calcularPromedio().toFixed(2)})`);
        });
    }
}

// [6] Ver estadísticas generales del grupo
function opcionVerEstadisticas(curso) {
    if (curso.estudiantes.length === 0) {
        console.log("ℹ️ No hay estudiantes en el curso.");
        return;
    }
    const promedioGeneral = curso.calcularPromedioGeneral();
    const aprobados = curso.obtenerAprobados().length;
    const reprobados = curso.obtenerReprobados().length;
    const total = curso.estudiantes.length;
    console.log("\n--- Estadísticas Generales ---");
    console.log(`Total de estudiantes: ${total}`);
    console.log(`Promedio general del curso: ${promedioGeneral.toFixed(2)}`);
    console.log(`Aprobados: ${aprobados}`);
    console.log(`Reprobados: ${reprobados}`);
}

// [7] Mostrar todos los estudiantes del curso
function mostrarTodosLosEstudiantes(curso) {
    console.log("\n--- Lista Completa de Estudiantes ---");
    if (curso.estudiantes.length === 0) {
        console.log("ℹ️ No hay estudiantes registrados en el curso.");
        return;
    }
    curso.estudiantes.forEach(est => {
        console.log(est.obtenerInformacion() + `, Estado: ${est.estaAprobado(curso.notaMinimaAprobacion) ? 'Aprobado' : 'Reprobado'}`);
    });
}

// --- Función para esperar a que el usuario presione Enter ---
async function presioneEnterParaContinuar() {
    await preguntar("\nPresione Enter para continuar...");
}

// --- Lógica Principal del Menú ---
async function menuPrincipal() {
    let cursoIngSoftware;

    // Cargar o inicializar curso
    cursoIngSoftware = await cargarCurso();

    if (!cursoIngSoftware) {
        console.log("\nℹ️ No se encontraron datos de curso guardados.");
        const usarPrueba = await preguntar("¿Desea usar datos de prueba? (s/n): ");
        cursoIngSoftware = new Curso("Introducción a la Ingeniería de Software", 70); // Crear instancia base
        if (usarPrueba.toLowerCase() === 's') {
            crearDatosDePrueba(cursoIngSoftware);
            await guardarCurso(cursoIngSoftware); // Guardar los datos de prueba iniciales
        } else {
            console.log("ℹ️ Iniciando con un curso vacío.");
            // Opcionalmente, guardar el curso vacío para que el archivo exista
            // await guardarCurso(cursoIngSoftware);
        }
    } else {
        console.log(`\nBienvenido de nuevo al curso: ${cursoIngSoftware.nombreCurso}`);
    }


    let continuar = true;
    while (continuar) {
        console.log(`
✨✨ ----------------------------------------------✨✨
--- Bienvenido al sistema de calificaciones escolares ---
✨✨ ----------------------------------------------✨✨
[1] ➕   Agregar estudiante
[2] 🖋️   Agregar nota de estudiante
[3] 🔎   Consultar promedio por estudiante
[4] 👀   Ver lista de aprobados
[5] 💀   Ver lista de reprobados
[6] 📑   Ver estadísticas generales del grupo
[7] 👥   Mostrar todos los estudiantes del curso
[8] 👣   Salir
        `);

        const opcion = await preguntar("Seleccione una opción: ");

        switch (opcion) {
            case '1':
                await opcionCrearEstudiante(cursoIngSoftware);
                await presioneEnterParaContinuar();
                break;
            case '2':
                await opcionAgregarNotaEstudiante(cursoIngSoftware);
                await presioneEnterParaContinuar();
                break;
            case '3':
                await opcionConsultarPromedioEstudiante(cursoIngSoftware);
                await presioneEnterParaContinuar();
                break;
            case '4':
                opcionVerAprobados(cursoIngSoftware);
                await presioneEnterParaContinuar();
                break;
            case '5':
                opcionVerReprobados(cursoIngSoftware);
                await presioneEnterParaContinuar();
                break;
            case '6':
                opcionVerEstadisticas(cursoIngSoftware);
                await presioneEnterParaContinuar();
                break;
            case '7':
                mostrarTodosLosEstudiantes(cursoIngSoftware);
                await presioneEnterParaContinuar();
                break;
            case '8':
                continuar = false;
                break;
            default:
                console.log("⚠️ Opción no válida. Intente de nuevo.");
                await presioneEnterParaContinuar();
        }
    }

    console.log("\n💾 Guardando datos antes de salir...");
    await guardarCurso(cursoIngSoftware);
    console.log("👋 ¡Hasta luego!");
    rl.close(); // Muy importante para que el programa termine
}

// Ejecutar el menú principal
menuPrincipal().catch(err => {
    console.error("\n❌ Error inesperado en la aplicación:", err);
    rl.close(); // Cerrar readline en caso de error no capturado para permitir salida
});
