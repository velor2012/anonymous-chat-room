import { useEffect, useRef } from "react"

import { nameToColor, strToRGB } from "@/tools/utils"
import { theme } from "@/tools/setting"
import { Track } from "livekit-client"

interface Audio {
  track?: Track
  name: string
  muteState: boolean | false
}

export default function AudioVisualizer(props: Audio) {
  const analyserCanvas = useRef(null)
  useEffect(() => {
    if(props.track == undefined) return
    const audio = props.track.mediaStream 
    const color = nameToColor(props.name)
    if (audio === undefined) return
    const audioCtx = new AudioContext()
    if (!audio.active) return
    const analyser = audioCtx.createAnalyser()
    const audioSrc = audioCtx.createMediaStreamSource(audio)
    audioSrc.connect(analyser)
    analyser.fftSize = 256
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteTimeDomainData(dataArray)

    const canvas : any = analyserCanvas.current
    const canvasCtx = canvas.getContext("2d")

    const g = color[1]
    const b = color[2]

    const draw = () => {
      const WIDTH = canvas.width
      const HEIGHT = canvas.height

      requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      // clear canvas for next drawing
      canvasCtx.fillStyle = theme.color1
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)

      const barWidth = 4
      let barHeight: number
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2

        // const r = Math.floor(barHeight + 64)
        // if (g % 3 === 0) {
        //   canvasCtx.fillStyle = `rgb(${r},${g},${b})`
        // } else if (g % 3 === 1) {
        //   canvasCtx.fillStyle = `rgb(${g},${r},${b})`
        // } else {
        //   canvasCtx.fillStyle = `rgb(${g},${b},${r})`
        // }
        canvasCtx.fillStyle = `rgb(255,255,255)`

        canvasCtx.fillRect(x, 40 - barHeight / 2, barWidth, barHeight)

        x += barWidth + 2
      }
    }
    draw()
  }, [props.track, props.name])

  return (
    <div className="visualizer mx-auto mt-4">
      <canvas ref={analyserCanvas} className="h-12 w-4/5"></canvas>
    </div>
  )
}
