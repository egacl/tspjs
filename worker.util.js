
const callWorker = (data, workerInstance) => {
    return new Promise((resolve, reject) => {
        workerInstance.on('message', resolve);
        workerInstance.on('error', reject);
        workerInstance.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
        if (data) {
            workerInstance.postMessage(data);
        }
    });
}

module.exports = {
    callWorker,
};
