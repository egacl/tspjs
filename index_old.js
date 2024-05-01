const fs = require('fs');

const readJsonFile = (nombreArchivo) => {
    const rutaArchivo = `fuentes/${nombreArchivo}`;
    try {
        const content = fs.readFileSync(rutaArchivo, 'utf-8');
        const jsonObject = JSON.parse(content);
        return jsonObject;
    } catch (error) {
        console.error('Error al leer el archivo:', error);
        return null;
    }
}

function generateRandomRoute(cityCount) {
    const route = [];
    for (let i=0 ; i<cityCount-1 ; i++) {
        route.push(i);
    }
    for (let i = route.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [route[i], route[j]] = [route[j], route[i]];
    }
    // se deja el cero siempre al inicio
    route.unshift(0);
    return route;
}

function calculateTotalDistance(route, distances) {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
        const cityA = route[i];
        const cityB = route[i + 1];
        totalDistance += distances[cityA][cityB];
    }
    totalDistance += distances[route[route.length - 1]][route[0]];
    return totalDistance;
}

function swapCities(route, i, j) {
    [route[i], route[j]] = [route[j], route[i]];
}

function findOptimalSolution(route, distances, maxIterations) {
    const initialDistance = calculateTotalDistance(route, distances);
    let optimalRoute = route.slice();
    let optimalDistance = initialDistance;

    for (let iteration=0 ; iteration<maxIterations ; iteration++) {
        let improved = false;
        for(let i=1 ; i<route.length-1 ; i++) {
            for(let j=i+1 ; j<route.length ; j++) {
                // Intercambiar ciudades en la ruta
                swapCities(route, i, j);
                // Calcular la distancia de la nueva ruta
                const newDistance = calculateTotalDistance(route, distances);
                // Si la nueva distancia es menor, actualizar la ruta y la distancia o optima
                if (newDistance < optimalDistance) {
                    optimalRoute = route.slice();
                    optimalDistance = newDistance;
                    improved = true;
                } else {
                    // Si la distancia no mejora, deshacer el intercambio
                    swapCities(route, i, j);
                }
            }
        }
        if (!improved) {
            break;
        }
    }

    return { route: optimalRoute, distance: optimalDistance };
}

const maxIterations = 1000000;

(async () => {
    const berlin52Distances = readJsonFile('berlin52.json');
    const cityCount = berlin52Distances.length;
    const initialRoute = generateRandomRoute(cityCount);
    const initialCost = calculateTotalDistance(initialRoute, berlin52Distances);
    console.log("Ruta inicial:", initialRoute);
    console.log("Distancia inicial:", initialCost);
    const { route, distance } = findOptimalSolution(initialRoute, berlin52Distances, maxIterations);
    console.log("Ruta optima:", route);
    console.log("Distancia optima:", distance);
})();
