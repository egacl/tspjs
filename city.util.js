const fs = require('fs');
const Nodo = require('./nodo.class');

const readJsonFile = (nombreArchivo, isJson = true) => {
    const rutaArchivo = `fuentes/${nombreArchivo}`;
    if (isJson) {
        try {
            const content = fs.readFileSync(rutaArchivo, 'utf-8');
            const jsonObject = JSON.parse(content);
            return jsonObject;
        } catch (error) {
            console.error('Error al leer el archivo:', error);
            return null;
        }
    } else {
        try {
            const texto = fs.readFileSync(rutaArchivo, 'utf-8');
            // Dividir el texto en líneas y luego en valores numéricos
            const lineas = texto.trim().split('\n');
            const matriz = lineas.map(linea => linea.split(',').map(Number));
            return matriz;
        } catch (error) {
            console.error('Error al leer el archivo:', error);
            return null;
        }
    }
}

const generateRandomRoute = (cityCount, random = false) => {
    const route = [];
    if (random) {
        for (let i=1 ; i<cityCount ; i++) {
            route.push(i);
        }
        for (let i = route.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [route[i], route[j]] = [route[j], route[i]];
        }
        // se deja el cero siempre al inicio
        route.unshift(0);
    } else {
        for (let i=0 ; i<cityCount ; i++) {
            route.push(i);
        }
    }
    return route;
}

const generateNodes = (routeArray) => {
    let nodesArray = Array(routeArray.length);
    let nextNode;
    for (let i=0 ; i<routeArray.length-1 ; i++) {
        let actualNode = nodesArray[routeArray[i]];
        if (!actualNode) {
            actualNode = new Nodo(routeArray[i], null, null, i);
            nodesArray[routeArray[i]] = actualNode;
        }
        nextNode = new Nodo(routeArray[i+1], actualNode, null, i+1);
        actualNode.sig = nextNode;
        nodesArray[routeArray[i+1]] = nextNode;
    }
    // se une el ultimo con el primero
    nextNode.sig = nodesArray[0];
    nodesArray[0].ant = nextNode;
    return nodesArray;
}

const calculateTotalDistance = (nodes, cityDistances) => {
    let totalDistance = 0;
    let currentNode = nodes[0];
    do {
        const nextNode = currentNode.sig;
        totalDistance += cityDistances[currentNode.id][nextNode.id];
        currentNode = nextNode;
    } while (currentNode != nodes[0]);
    return totalDistance;
}

const printNodes = (nodes) => {
    const init = nodes[0];
    console.log(`Nodo pos[${init.posicion}]id[${init.id}] = { ant => ${init.ant.id} , sig => ${init.sig.id} }`)
    // console.log(init);
    let nextNode = init.sig;
    do {
        console.log(`Nodo pos[${nextNode.posicion}]id[${nextNode.id}] = { ant => ${nextNode.ant.id} , sig => ${nextNode.sig.id} }`)
        // console.log(nextNode);
        nextNode = nextNode.sig;
    } while(nextNode != init);
}

const getRandomIndex = (maxSize) => {
    return Math.floor(Math.random() * maxSize);
}

const getRandomNode = (nodes) => {
    const randomIndex = getRandomIndex(nodes.length);
    return nodes[randomIndex];
}

const buildRouteArray = (nodes) => {
    const init = nodes[0];
    const route = [];
    route.push(init.id);
    let nextNode = init.sig;
    do {
        route.push(nextNode.id);
        nextNode = nextNode.sig;
    } while(nextNode != init);
    return route;
}

const computeCandidates = (cityDistances, candidatesLength) => {
    const nodesCandidates = new Array(cityDistances.length).fill().map(() => []);
    const n = cityDistances.length;
    for (let i = 0; i < n; i++) {
        const cola = [];
        for (let j = 0; j < n; j++) {
            if (i === j) {
                continue;
            }
            cola.push({ coste: cityDistances[i][j], indice: j });
        }

        cola.sort((a, b) => a.coste - b.coste);
        
        for (let k = 0; k < candidatesLength; k++) {
            if (cola.length > 0) {
                let aux = cola.shift();
                nodesCandidates[i].push(aux.indice);
            }
        }
    }
    // console.log('nodesCandidates: ', nodesCandidates);
    return nodesCandidates;
}

const between = (minor, mayor, between) => {
    const betweenPos = between.posicion;
    const minorPos = minor.posicion;
    const mayorPos = mayor.posicion;
    return  (
                minorPos <= betweenPos 
                && betweenPos <= mayorPos
            ) ||
            (
                mayorPos < minorPos 
                &&
                (
                    minorPos <= betweenPos 
                    || betweenPos <= mayorPos
                )
            );
}

const crearSolucion = (cityDistances) => {
    const randomRoute = generateRandomRoute(cityDistances.length, true);
    return generateNodes(randomRoute);
}

module.exports = {
    readJsonFile,
    generateRandomRoute,
    generateNodes,
    printNodes,
    getRandomIndex,
    getRandomNode,
    calculateTotalDistance,
    buildRouteArray,
    computeCandidates,
    between,
    crearSolucion,
}
