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
    const calificaciones = [];
    let continuarIngresando = true;

    while (continuarIngresando) {
        const califStr = await preguntar(`Ingrese calificación (o 'fin' para terminar): `);
        if (califStr.toLowerCase() === 'fin') {
            continuarIngresando = false;
        } else {
            const califNum = parseFloat(califStr);
            if (!isNaN(califNum)) {
                calificaciones.push(califNum);
            } else {
                console.log("⚠️ Calificación inválida. Por favor ingrese un número.");
            }
        }
    }

    if (id && nombre) {
        const nuevoEstudiante = new Estudiante(id, nombre, calificaciones);
        curso.agregarEstudiante(nuevoEstudiante);
        console.log(`\n👍 Estudiante "${nombre}" agregado al curso.`);
        await guardarCurso(curso); // Guardar después de agregar
    } else {
        console.log("\n⚠️ ID y Nombre son obligatorios. No se agregó el estudiante.");
    }
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

function opcionMostrarAprobadosReprobados(curso) {
    console.log("\n--- Estado de Estudiantes ---");
     if (curso.estudiantes.length === 0) {
        console.log("ℹ️ No hay estudiantes en el curso.");
        return;
    }
    console.log(`(Nota mínima para aprobar: ${curso.notaMinimaAprobacion})`);

    const aprobados = curso.obtenerAprobados();
    console.log("\nEstudiantes Aprobados:");
    if (aprobados.length > 0) {
        aprobados.forEach(est => console.log(`  - ${est.nombre} (Promedio: ${est.calcularPromedio().toFixed(2)})`));
    } else {
        console.log("  ℹ️ Ningún estudiante aprobado.");
    }

    const reprobados = curso.obtenerReprobados();
    console.log("\nEstudiantes Reprobados:");
    if (reprobados.length > 0) {
        reprobados.forEach(est => console.log(`  - ${est.nombre} (Promedio: ${est.calcularPromedio().toFixed(2)})`));
    } else {
        console.log("  ℹ️ Ningún estudiante reprobado.");
    }
}

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
        console.log("\n--- Menú Principal ---");
        console.log("1. Crear estudiante y agregarlo al curso");
        console.log("2. Calcular y mostrar promedio individual y general del curso");
        console.log("3. Mostrar lista de aprobados y reprobados");
        console.log("4. Mostrar todos los estudiantes del curso");
        console.log("0. Salir");

        const opcion = await preguntar("Seleccione una opción: ");

        switch (opcion) {
            case '1':
                await opcionCrearEstudiante(cursoIngSoftware);
                break;
            case '2':
                opcionMostrarPromedios(cursoIngSoftware);
                break;
            case '3':
                opcionMostrarAprobadosReprobados(cursoIngSoftware);
                break;
            case '4':
                mostrarTodosLosEstudiantes(cursoIngSoftware);
                break;
            case '0':
                continuar = false;
                break;
            default:
                console.log("⚠️ Opción no válida. Intente de nuevo.");
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