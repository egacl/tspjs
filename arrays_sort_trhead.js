const WorKerUtils = require('./worker.util');
const { Worker } = require('worker_threads');

const generateRandomSharedArray = (lengthArray) => {
    const buffer = new SharedArrayBuffer(lengthArray * Int32Array.BYTES_PER_ELEMENT);
    const sharedArray = new Int32Array(buffer);
    for (let i = 1; i < lengthArray; i++) {
        sharedArray[i] = i;
    }
    for (let i = lengthArray - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sharedArray[i], sharedArray[j]] = [sharedArray[j], sharedArray[i]];
    }

    return sharedArray;
};

const mergeSortedArrays = (sortedArrays) => {
    const output = [];
    const indexTracker = new Array(sortedArrays.length).fill(0);
    while (true) {
        let minIndex = -1;
        let minValue = Number.POSITIVE_INFINITY;
        for (let i = 0; i < sortedArrays.length; i++) {
            const currentIndex = indexTracker[i];
            if (currentIndex < sortedArrays[i].length && sortedArrays[i][currentIndex] < minValue) {
                minValue = sortedArrays[i][currentIndex];
                minIndex = i;
            }
        }
        if (minIndex === -1) {
            break;
        }
        output.push(minValue);
        indexTracker[minIndex]++;
    }
    return output;
}

const LARGO_ARRAY = 15;
const CANTIDAD_HEBRAS = 3;

(async () => {
    const randomArray = generateRandomSharedArray(LARGO_ARRAY);
    console.log('Programa principal crea array: ', randomArray);
    const promises = [];
    for (let i=1; i<=CANTIDAD_HEBRAS ; i++) {
        promises.push(WorKerUtils.callWorker(null,
            new Worker('./worker_sort_array.js', {
                workerData: {
                    buffer: randomArray.buffer,
                    id: (i-1),
                    partes: CANTIDAD_HEBRAS,
                }
            }))
        );
    }
    const results = await Promise.all(promises);
    const finalArray = mergeSortedArrays(results);
    console.log('Programa principal array final: ', finalArray);
})();