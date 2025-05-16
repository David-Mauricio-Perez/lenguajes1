// CalcularNotas.js
// Documentación:
// Este módulo contiene la función para calcular el promedio general de un curso.

/**
 * @function calcularPromedioGeneralCurso
 * @description Calcula el promedio general de un grupo de estudiantes (objetos Estudiante).
 * @param {Estudiante[]} estudiantes - Un array de objetos Estudiante, cada uno con un método calcularPromedio().
 * @returns {number} El promedio general del curso. Retorna 0 si no hay estudiantes o ninguno tiene promedio.
 */
export function calcularPromedioGeneralCurso(estudiantes) {
    if (!estudiantes || estudiantes.length === 0) {
        return 0;
    }

    const promediosIndividuales = estudiantes.map(est => {
        if (typeof est.calcularPromedio === 'function') {
            return est.calcularPromedio();
        }
        console.warn("Se encontró un estudiante sin método calcularPromedio:", est);
        return 0;
    });

    // Filtrar promedios que pudieron ser 0 por error o porque el estudiante no tenía notas
    const promediosValidos = promediosIndividuales.filter(p => typeof p === 'number');

    if (promediosValidos.length === 0) {
        return 0;
    }

    const sumaDePromedios = promediosValidos.reduce((acc, curr) => acc + curr, 0);
    return sumaDePromedios / promediosValidos.length;
}