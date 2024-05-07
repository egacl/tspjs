
const CityUtils = require('./city.util');
const TspUtils = require('./tsp.util');

let cityDistances;
let routeCost;

const CANDIDATES_LENGTH = 25;
const ITERACIONES = 100;

(async () => {
    cityDistances = CityUtils.readJsonFile('berlin52.json');
    // cityDistances = CityUtils.readJsonFile('att532.dat', false);
    // cityDistances = CityUtils.readJsonFile('10.json');
    const nodesCandidates = CityUtils.computeCandidates(cityDistances, CANDIDATES_LENGTH);
    console.time("totalCost");
    let mejor;
    for (let i=1; i<=ITERACIONES ; i++) {
        const routeNodes = CityUtils.crearSolucion(cityDistances);
        routeCost = CityUtils.calculateTotalDistance(routeNodes, cityDistances);
        if (i == 1) {
            console.log('Costo inicial: ', routeCost);
        }
        const auxMejor = TspUtils.findOptimalSolution(routeNodes, mejor, nodesCandidates, cityDistances);
        if (!mejor || auxMejor.routeCost < mejor.routeCost) {
            mejor = auxMejor;
            console.log('Solucion mejor encontrada: ', mejor.routeCost);
            // console.log('Nodos: ', mejor.routeNodes);
        }
    }
    console.timeEnd("totalCost");
})();