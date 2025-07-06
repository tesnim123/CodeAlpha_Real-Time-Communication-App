// VideoCall.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng'

type VideoCallProps = {
  channel: string
  isVideo: boolean
  onHangUp: () => void
}

const appId = 'ChatApp'

const VideoCall: React.FC<VideoCallProps> = ({ channel, isVideo, onHangUp }) => {
  const clientRef = useRef<IAgoraRTCClient | null>(null)
  const localVideoRef = useRef<HTMLDivElement | null>(null)
  const remoteVideoRef = useRef<HTMLDivElement | null>(null)
  const [localTracks, setLocalTracks] = useState<any[]>([])

  useEffect(() => {
    const setupCall = async () => {
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
      clientRef.current = client

      await client.join(appId, channel, null, null)

      const tracks = await AgoraRTC.createMicrophoneAndCameraTracks()
      setLocalTracks(tracks)

      if (isVideo && localVideoRef.current) {
        tracks[1].play(localVideoRef.current)
      }

      await client.publish(tracks)

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType)
        if (mediaType === 'video' && remoteVideoRef.current && user.videoTrack) {
          user.videoTrack.play(remoteVideoRef.current)
        } else if (mediaType === 'audio' && user.audioTrack) {
          user.audioTrack.play()
        }
      })
    }

    setupCall()

    return () => {
      localTracks.forEach((track) => {
        track.stop()
        track.close()
      })
      clientRef.current?.leave()
    }
  }, [channel, isVideo])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4">
        {isVideo && <div ref={localVideoRef} className="w-64 h-48 bg-black" />}
        <div ref={remoteVideoRef} className="w-64 h-48 bg-black" />
      </div>
      <button
        onClick={onHangUp}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Hang Up
      </button>
    </div>
  )
}

export default VideoCall
