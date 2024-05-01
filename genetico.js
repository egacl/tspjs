
const CityUtils = require('./city.util');
const TspUtils = require('./tsp.util');
const WorKerUtils = require('./worker.util');
const { Worker } = require('worker_threads');

const calcularPromedio = (arr) => {
    const suma = arr.reduce((acumulador, valorActual) => acumulador + valorActual, 0);
    return suma / arr.length;
}

const calcularDesviacionEstandar = (arr) => {
    const promedio = calcularPromedio(arr);
    const sumaCuadrados = arr.reduce((acumulador, valorActual) => {
      const diferencia = valorActual - promedio;
      return acumulador + diferencia * diferencia;
    }, 0);
    return Math.sqrt(sumaCuadrados / arr.length);
}

const encontrarMenorYMayor = (arr) => {
    if (arr.length === 0) {
      return 'El arreglo está vacío';  // Manejo de caso de arreglo vacío
    }
    let menor = arr[0];
    let mayor = arr[0];
    
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < menor) {
        menor = arr[i];
      }
      if (arr[i] > mayor) {
        mayor = arr[i];
      }
    }
    return { menor, mayor };
}

const CANDIDATES_LENGTH = 25;
const ITERACIONES = 10;
const CANTIDAD_POBLACION = 100;
const CHUNK_PARALLEL_CREAR_POBLACION = 10; // para que se haga en 1 hebra, debe ir en 100

(async () => {
    cityDistances = CityUtils.readJsonFile('att532.dat', false);
    const nodesCandidates = CityUtils.computeCandidates(cityDistances, CANDIDATES_LENGTH);
    console.time("totalCost");
    const poblacion = [];
    let arrayCostos = [CANTIDAD_POBLACION];
    const parallelPoblacion = CANTIDAD_POBLACION / CHUNK_PARALLEL_CREAR_POBLACION;
    const promises = [];
    for (let k=0; k<CHUNK_PARALLEL_CREAR_POBLACION ; k++) {
        promises.push(WorKerUtils.callWorker(
            {
                CANTIDAD_POBLACION: parallelPoblacion,
                nodesCandidates,
                cityDistances,
                ITERACIONES
            },
            new Worker('./genetico_poblacion.js'))
        );
    }
    const results = await Promise.all(promises);
    let index=0;
    results.forEach((result, i) => {
        for (let individuo of result) {
            poblacion.push(individuo);
            arrayCostos[index] = individuo.routeCost;
            // para validar
            // console.log(`Individuo <${index}> costo = ${individuo.routeCost} | Costo nuevo calculado = ${CityUtils.calculateTotalDistance(individuo.routeNodes, cityDistances)} | isConexa = ${TspUtils.isConexa(individuo.routeNodes)}`);
            index++;
        }
    });
    console.log("Creacion de problacion terminada");
    console.log("\t > Poblacion: ", poblacion.length);
    console.log("\t > Promedio: ", calcularPromedio(arrayCostos));
    console.log("\t > Desviacion estandar: ", calcularDesviacionEstandar(arrayCostos));
    console.log("\t > Menor y Mayor: ", encontrarMenorYMayor(arrayCostos));
    console.timeEnd("totalCost");
    process.exit(0);
})();
