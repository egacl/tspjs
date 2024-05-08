const { parentPort, workerData } = require('worker_threads');

const obtenerIndicesDeTrabajo = (array, indice, partes) => {
    const longitud = array.length;
    let tamanioParte = Math.floor(longitud / partes);
    let sobrante = longitud % partes;
    let inicio = 0;
    let tamanioActual = 0;
    for (let i = 0; i < partes; i++) {
        tamanioActual = tamanioParte + (sobrante > 0 ? 1 : 0);
        sobrante -= 1;
        if (i == indice) {
            break;
        }
        inicio += tamanioActual;
    }
    return {
        inicio,
        fin: inicio + (tamanioActual - 1),
    };
}

const ordenarSubarray = (array, inicio, fin) => {
    if (inicio < 0 || fin >= array.length || inicio > fin) {
        throw new Error('Índices fuera de rango o no válidos');
    }
    const subarray = array.slice(inicio, fin + 1);
    subarray.sort((a, b) => a - b);
    return subarray;
}

try {
    const sharedArray = new Int32Array(workerData.buffer);
    const id = workerData.id;
    const partes = workerData.partes;
    const { inicio, fin } = obtenerIndicesDeTrabajo(sharedArray, id, partes);
    // console.log(`Worker ID ${id}: Array recibido y se procesan posiciones: `, { inicio, fin });
    const sortedSubArray = ordenarSubarray(sharedArray, inicio, fin);
    console.log(`Worker ID ${id}: Se ordenan numeros del array: `, sortedSubArray);
    // console.log(`Worker ID ${id}: sharedArray: `, sharedArray);
    parentPort.postMessage(sortedSubArray);
}
catch (err) {
    console.error(err);
}
