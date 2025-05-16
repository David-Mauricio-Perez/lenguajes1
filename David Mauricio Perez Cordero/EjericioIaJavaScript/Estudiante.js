// Estudiante.js
// Documentación:
// Este módulo define la clase Estudiante.
// Se utiliza para representar a un estudiante con su ID, nombre y calificaciones.
// Incluye métodos para calcular su promedio, determinar si está aprobado,
// y métodos para serialización/deserialización JSON.

/**
 * @class Estudiante
 * @description Representa a un estudiante con sus datos y calificaciones.
 * @param {string|number} id - Identificador único del estudiante.
 * @param {string} nombre - Nombre completo del estudiante.
 * @param {number[]} calificaciones - Array de calificaciones numéricas del estudiante.
 */
export class Estudiante {
  constructor(id, nombre, calificaciones = []) {
    this.id = id;
    this.nombre = nombre;
    this.calificaciones = calificaciones;
  }

  agregarCalificacion(calificacion) {
    this.calificaciones.push(calificacion);
  }

  calcularPromedio() {
    if (this.calificaciones.length === 0) {
      return 0;
    }
    const suma = this.calificaciones.reduce((acc, curr) => acc + curr, 0);
    return suma / this.calificaciones.length;
  }

  estaAprobado(notaMinimaAprobacion) {
    return this.calcularPromedio() >= notaMinimaAprobacion;
  }

  obtenerInformacion() {
    return `ID: ${this.id}, Nombre: ${
      this.nombre
    }, Calificaciones: [${this.calificaciones.join(
      ", "
    )}], Promedio: ${this.calcularPromedio().toFixed(2)}`;
  }

  /**
   * @method toJSON
   * @description Prepara el objeto para ser serializado a JSON.
   * @returns {object} Un objeto plano con los datos del estudiante.
   * Este método es invocado implícitamente por JSON.stringify() si está presente en el objeto.
   */
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      calificaciones: this.calificaciones,
    };
  }

  /**
   * @static
   * @method fromJSON
   * @description Crea una instancia de Estudiante a partir de un objeto plano (proveniente de JSON).
   * @param {object} json - El objeto plano con datos del estudiante.
   * @returns {Estudiante} Una nueva instancia de Estudiante.
   */
  static fromJSON(json) {
    if (
      !json ||
      typeof json.id === "undefined" ||
      typeof json.nombre === "undefined" ||
      !Array.isArray(json.calificaciones)
    ) {
      console.error("Objeto JSON inválido para crear Estudiante:", json);
      return new Estudiante("INVALID_ID", "INVALID_NAME", []); // Retornar una instancia por defecto o manejar el error
    }
    return new Estudiante(json.id, json.nombre, json.calificaciones);
  }
}
