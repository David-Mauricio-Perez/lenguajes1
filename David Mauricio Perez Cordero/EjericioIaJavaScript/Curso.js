// Curso.js
// Documentación:
// Este módulo define la clase Curso.
// Se utiliza para agrupar estudiantes, calcular el promedio general del curso
// y obtener listas de estudiantes aprobados y reprobados.
// Incluye métodos para serialización/deserialización JSON.
// Importa:
// - Estudiante de './Estudiante.js': Para rehidratar estudiantes desde JSON.
// - calcularPromedioGeneralCurso de './CalcularNotas.js': Para calcular el promedio del curso.

import { Estudiante } from './Estudiante.js'; // Necesario para Estudiante.fromJSON
import { calcularPromedioGeneralCurso } from './CalcularNotas.js';

/**
 * @class Curso
 * @description Representa un curso que contiene un grupo de estudiantes.
 * @param {string} nombreCurso - Nombre del curso.
 * @param {number} notaMinimaAprobacion - Nota mínima para aprobar el curso.
 */
export class Curso {
    constructor(nombreCurso, notaMinimaAprobacion = 60) {
        this.nombreCurso = nombreCurso;
        this.estudiantes = []; // Array de instancias de Estudiante
        this.notaMinimaAprobacion = notaMinimaAprobacion;
    }

    agregarEstudiante(estudiante) {
        this.estudiantes.push(estudiante);
    }

    calcularPromedioGeneral() {
        return calcularPromedioGeneralCurso(this.estudiantes);
    }

    obtenerAprobados() {
        return this.estudiantes.filter(est => est.estaAprobado(this.notaMinimaAprobacion));
    }

    obtenerReprobados() {
        return this.estudiantes.filter(est => !est.estaAprobado(this.notaMinimaAprobacion));
    }

    mostrarResultados() {
        console.log(`--- Resultados del Curso: ${this.nombreCurso} ---`);
        console.log(`Nota mínima para aprobar: ${this.notaMinimaAprobacion}`);
        console.log(`Promedio General del Curso: ${this.calcularPromedioGeneral().toFixed(2)}`);
        console.log("\n--- Detalle de Estudiantes ---");
        this.estudiantes.forEach(est => {
            console.log(est.obtenerInformacion() + `, Estado: ${est.estaAprobado(this.notaMinimaAprobacion) ? 'Aprobado' : 'Reprobado'}`);
        });
        console.log("\n--- Estudiantes Aprobados ---");
        const aprobados = this.obtenerAprobados();
        if (aprobados.length > 0) {
            aprobados.forEach(est => console.log(est.nombre));
        } else {
            console.log("Ningún estudiante aprobado.");
        }
        console.log("\n--- Estudiantes Reprobados ---");
        const reprobados = this.obtenerReprobados();
        if (reprobados.length > 0) {
            reprobados.forEach(est => console.log(est.nombre));
        } else {
            console.log("Ningún estudiante reprobado.");
        }
        console.log("-------------------------------------\n");
    }

    /**
     * @method toJSON
     * @description Prepara el objeto para ser serializado a JSON.
     * @returns {object} Un objeto plano con los datos del curso y sus estudiantes.
     * Llama a toJSON() en cada estudiante para serializarlos correctamente.
     */
    toJSON() {
        return {
            nombreCurso: this.nombreCurso,
            notaMinimaAprobacion: this.notaMinimaAprobacion,
            estudiantes: this.estudiantes.map(est => est.toJSON()) // Asegura que cada estudiante se serialice bien
        };
    }

    /**
     * @static
     * @method fromJSON
     * @description Crea una instancia de Curso a partir de un objeto plano (proveniente de JSON).
     * @param {object} json - El objeto plano con datos del curso.
     * @returns {Curso} Una nueva instancia de Curso.
     */
    static fromJSON(json) {
        if (!json || typeof json.nombreCurso === 'undefined' || typeof json.notaMinimaAprobacion === 'undefined' || !Array.isArray(json.estudiantes)) {
            console.error("Objeto JSON inválido para crear Curso:", json);
            return new Curso('INVALID_CURSO_NAME', 0);
        }
        const curso = new Curso(json.nombreCurso, json.notaMinimaAprobacion);
        // Rehidratamos cada estudiante del JSON a una instancia de Estudiante usando Estudiante.fromJSON
        curso.estudiantes = json.estudiantes.map(estJson => Estudiante.fromJSON(estJson));
        return curso;
    }
}