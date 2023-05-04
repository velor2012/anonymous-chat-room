

const FFT_SIZE = 2048

export const setupVisualizer = (
    canvas: HTMLCanvasElement,
    audioCtx: AudioContext
) => {
    const canvasCtx = canvas.getContext('2d')
    if (canvasCtx === null) {
        throw new Error('canvasCtx was null')
    }

    const analyzer = audioCtx.createAnalyser()
    analyzer.fftSize = FFT_SIZE
    const analyzeResultArray = new Uint8Array(analyzer.fftSize)

        ; (async () => {
            const { height, width } = canvas
            const gap = width / analyzeResultArray.length

            for await (const _ of rafIter()) {
                analyzer.getByteTimeDomainData(analyzeResultArray)

                canvasCtx.fillStyle = 'black'
                canvasCtx.fillRect(0, 0, width, height)

                canvasCtx.beginPath()
                canvasCtx.strokeStyle = 'green'
                canvasCtx.lineWidth = 1
                for (const [i, data] of analyzeResultArray.entries()) {
                    const x = gap * i
                    const y = height * (data / 256)

                    if (i === 0) {
                        canvasCtx.moveTo(x, y)
                    } else {
                        canvasCtx.lineTo(x, y)
                    }
                }
                canvasCtx.lineTo(width, height / 2)
                canvasCtx.stroke()
            }
        })()

    return analyzer
}


const rafIter = (): AsyncIterableIterator<void> => {
    let id: number

    const obj = {
        async next() {
            const promise = new Promise(resolve => {
                requestAnimationFrame(resolve)
            })
            await promise
            return { value: undefined, done: false }
        },
        async return() {
            cancelAnimationFrame(id)
            return { value: undefined, done: true }
        },
        [Symbol.asyncIterator]() {
            return this
        }
    }

    return obj
}
