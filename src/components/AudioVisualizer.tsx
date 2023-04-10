import { useEffect, useRef } from "react"

import { nameToColor, strToRGB } from "@/tools/utils"
import { theme } from "@/tools/setting"
import { LocalAudioTrack, Participant, RemoteAudioTrack, Track, createAudioAnalyser } from "livekit-client"
import { useMediaTrack } from "@livekit/components-react"

interface Audio {
    participant:Participant
}

export default function AudioVisualizer(props: Audio) {
  const analyserCanvas = useRef(null)
  let { track } = useMediaTrack(Track.Source.Microphone, props.participant);

  useEffect(() => {
    if (!track || !(track instanceof LocalAudioTrack || track instanceof RemoteAudioTrack)) {

        return;
      }

    const { analyser, cleanup } = createAudioAnalyser(track, {
        smoothingTimeConstant: 0.85,
        fftSize: 64,
      });

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

    const canvas : any = analyserCanvas.current
    const canvasCtx = canvas.getContext("2d")

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

        canvasCtx.fillRect(x, 72 - barHeight / 2, barWidth, barHeight)

        x += barWidth + 2
      }
    }
    draw()
  }, [track, track?.isMuted, props.participant.isMicrophoneEnabled, props.participant.isSpeaking])

  return (
    <div className="visualizer mx-auto mt-2">
      <canvas ref={analyserCanvas} className=" h-16 w-4/5"></canvas>
    </div>
  )
}
