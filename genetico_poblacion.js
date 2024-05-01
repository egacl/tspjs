const { parentPort } = require('worker_threads');
const CityUtils = require('./city.util');
const TspUtils = require('./tsp.util');

parentPort.on('message', (data) => {
    const poblacion = [];
    for (let k=0; k<data.CANTIDAD_POBLACION ; k++) {
        let mejor;
        for (let i=1; i<=data.ITERACIONES ; i++) {
            const routeNodes = CityUtils.crearSolucion(data.cityDistances);
            routeCost = CityUtils.calculateTotalDistance(routeNodes, data.cityDistances);
            const auxMejor = TspUtils.findOptimalSolution(routeNodes, mejor, data.nodesCandidates, data.cityDistances);
            if (!mejor || auxMejor.routeCost < mejor.routeCost) {
                mejor = auxMejor;
            }
        }
        poblacion.push(mejor);
    }
    parentPort.postMessage(poblacion);
});