
const CityUtils = require('./city.util');

const SOLUTION_MULTIPLIER = 1;

const calculateNodesCost = (nodeA, nodeB, cityDistances) => {
    return cityDistances[nodeA.id][nodeB.id];
}

const getCandidates = (routeNodes, t0, t1, nodesCandidates, cityDistances) => {
    // como estamos usando movimiento hacia siguiente
    // entonces t2.ant es la opcion para elegir t3
    const t0t1ActualCost = calculateNodesCost(t0, t1, cityDistances);
    for (const t2CandidateID of nodesCandidates[t1.id]) {
        const t2Candidate = routeNodes[t2CandidateID];
        if (t2Candidate == t1 || t2Candidate == t1.sig || t2Candidate == t1.ant) {
            continue;
        }
        const t1t2NewCost = calculateNodesCost(t1, t2Candidate, cityDistances);
        // Calcular G0
        const g0 = t0t1ActualCost - t1t2NewCost;
        // console.log('g0: ', g0, ' (', t0t1ActualCost, ' - ', t0t3NewCost, ')');
        if (g0 <= 0) {
            // se descarta ya que no cumple por la ganancia 0
            continue;
        }
        const t3Candidate = t2Candidate.ant;
        const t2t3ActualCost = calculateNodesCost(t2Candidate, t3Candidate, cityDistances);
        const t0t3NewCost = calculateNodesCost(t0, t3Candidate, cityDistances);
        const g1 = g0 + t2t3ActualCost - t0t3NewCost;
        // console.log('g1: ', g1, ' (', g0, ' + ', t2t3ActualCost, ' - ', t1t2NewCost, ')');
        if (g1 <= 0) {
            // continue; // desactivar 3-OPT
            // se realiza movimiento 3-OPT
            for (const t4CandidateID of nodesCandidates[t3Candidate.id]) {
                const t4Candidate = routeNodes[t4CandidateID];
                if (t4Candidate == t3Candidate.sig || t4Candidate == t3Candidate.ant) {
                    continue;
                }
                const t3t4NewCost = calculateNodesCost(t3Candidate, t4Candidate, cityDistances);
                const g1t4 = g0 + (t2t3ActualCost - t3t4NewCost);
                if (g1t4 <= 0) {
                    continue;
                }
                const isBetween = CityUtils.between(t1, t3Candidate, t4Candidate);
                const t5Candidate = isBetween ? t4Candidate.sig : t4Candidate.ant;

                const t4t5ActualCost = calculateNodesCost(t4Candidate, t5Candidate, cityDistances);
                const t0t5NewCostCost = calculateNodesCost(t5Candidate, t0, cityDistances);
                const g2 = g1t4 + (t4t5ActualCost - t0t5NewCostCost);
                if (g2 > 0) {
                    // console.log('3-OPT newRouteCost: ', routeCost, ' = ', (g2 > 0), 'g2 = ', g2, ', isBetween = ', isBetween);
                    return {
                        t2: t2Candidate,
                        t3: t3Candidate,
                        t4: t4Candidate,
                        t5: t5Candidate,
                        revenue: g2
                    };
                }
            }
        } else {
            // console.log('2-OPT newRouteCost: ', routeCost, ' = ', (g1 > 0), 'g1 = ', g1);
            // si esto se cumple, significa que esta ruta es mejor que la actual
            return {
                t2: t2Candidate,
                t3: t3Candidate,
                revenue: g1,
            };
        }
    }
    return null;
}

const makeMove = (t0, t1, t2, t3, routeNodes) => {
    const routeSize = routeNodes.length;
    let nodesQtyT3t1 = t3.posicion - t1.posicion;
    if (nodesQtyT3t1 < 0) {
        nodesQtyT3t1 += routeSize;
    }
    let nodesQtyT0t2 = t0.posicion - t2.posicion;
    if (nodesQtyT0t2 < 0) {
        nodesQtyT0t2 += routeSize;
    }
    if (t0.sig == t1) {
        if (nodesQtyT3t1 <= nodesQtyT0t2) {
            // console.log('> Entra en t0, t1, t2, t3')
            // si esto se cumple, se debe mover desde t0 a t3, hasta llegar a t2
            move(t0, t1, t2, t3, routeSize);
        } else {
            // console.log('> Entra en t3, t2, t1, t0')
            // si esto se cumple, se debe mover desde t3 a t1 hasta llegar a t2
            move(t3, t2, t1, t0, routeSize);
        }
    } else {
        if (nodesQtyT3t1 <= nodesQtyT0t2) {
            move(t1, t0, t3, t2, routeSize);
        } else {
            move(t2, t3, t0, t1, routeSize);
        }
    }
}

const move = (t0, t1, t2, t3, routeSize) => {
    let actualNodeMove = t1;
    let position = t3.posicion;
    while (actualNodeMove != t2) {
        actualNodeMove.posicion = position;
        position--;
        if (position < 0) {
            position = routeSize - 1;
        };
        const aux = actualNodeMove.sig;
        actualNodeMove.sig = actualNodeMove.ant;
        actualNodeMove.ant = aux;
        // [actualNodeMove.sig, actualNodeMove.ant] = [actualNodeMove.ant, actualNodeMove.sig];
        // se continua con el siguiente (que ahora es el anterior)
        actualNodeMove = actualNodeMove.ant;
    }
    t0.sig = t3;
    t3.ant = t0;
    t1.sig = t2;
    t2.ant = t1;
}

const findOptimalSolution = (routeNodes, mejor, nodesCandidates, cityDistances) => {
    let routeCost = CityUtils.calculateTotalDistance(routeNodes, cityDistances);
    // CityUtils.printNodes(routeNodes);
    let t0;
    let t1;
    let cont = 0;
    const iterations = SOLUTION_MULTIPLIER * cityDistances.length;
    while (cont < iterations) {
        t0 = CityUtils.getRandomNode(routeNodes);
        t1 = t0.sig;
        if (mejor) {
            if (mejor.routeNodes[t0.id].sig.id == t1.id || mejor.routeNodes[t0.id].ant.id == t1.id) {
                cont++;
                continue;
            }
        }
        const moveCandidates = getCandidates(routeNodes, t0, t1, nodesCandidates, cityDistances);
        if (moveCandidates) {
            if (!moveCandidates.t4) {
                // console.log('movimiento: ', t0.id, t1.id, moveCandidates.t2.id, moveCandidates.t3.id);
                makeMove(t0, t1, moveCandidates.t2, moveCandidates.t3, routeNodes);
            } else {
                makeMove(t0, t1, moveCandidates.t2, moveCandidates.t3, routeNodes);
                makeMove(t0, moveCandidates.t3, moveCandidates.t4, moveCandidates.t5, routeNodes);
            }
            routeCost = routeCost - moveCandidates.revenue;
            cont = 0;
            // CityUtils.printNodes(routeNodes);
        } else {
            cont++;
        }
    }
    return {
        routeNodes,
        routeCost
    };
}

const isConexa = (routeNodes) => {
    const inicio = routeNodes[0];
    let actual = inicio.sig;
    let cont = 1;
    let pos = inicio.posicion;
    pos++;
    if (pos === routeNodes.length) {
        pos = 0;
    }
    while (actual !== inicio) {
        if (pos !== actual.posicion) {
            console.log(
                "esperada : " +
                    pos +
                    ", encontrada :" +
                    actual.posicion +
                    ", en nodo " +
                    actual.id,
            );
            return false;
        }
        pos++;
        if (pos === routeNodes.length) {
            pos = 0;
        }
        cont++;
        if (actual.sig.ant !== actual) {
            console.log("anterior mal configurado en nodo: " + actual.sig.id);
            return false;
        }
        actual = actual.sig;
        if (cont > routeNodes.length) {
            return false;
        }
    }
    return cont === routeNodes.length;
}

module.exports = {
    findOptimalSolution,
    makeMove,
    getCandidates,
    calculateNodesCost,
    isConexa,
}
