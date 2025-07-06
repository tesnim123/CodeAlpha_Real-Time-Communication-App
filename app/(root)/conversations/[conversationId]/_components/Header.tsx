'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'

import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { X, Phone, Video, Settings, CircleArrowLeft } from 'lucide-react'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

import { Id } from '@/convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { cn } from '@/lib/utils'
import VideoCall from './VideoCall'

/* ────────────────────────────────────────────────────────────────────────── */
/*  Chargement côté client du composant d’appel (pas de SSR pour WebRTC)     */
/* ────────────────────────────────────────────────────────────────────────── */


type Props = {
  imageUrl?: string
  name: string
  options?: {
    label: string
    destructive: boolean
    onClick: () => void
  }[]
  conversationId: Id<'conversations'>
  receiverId: Id<'users'>
}

const Header = ({
  imageUrl,
  name,
  options,
  conversationId,
  receiverId,
}: Props) => {
  const { user } = useUser()

  /* ────────────────────────
     États locaux d’appel
  ──────────────────────── */
  const [callId, setCallId] = useState<Id<'calls'> | null>(null)
  const [isVideo, setIsVideo] = useState<boolean>(false)

  /* Mutations Convex */
  const startCall = useMutation(api.call.start)
  const endCall = useMutation(api.call.end)

  /* ────────────────────────
     Démarrage / arrêt d’appel
  ──────────────────────── */
  const handleAudioCall = async () => {
    try {
      const newCallId: Id<'calls'> = await startCall({
        conversationId,
        receiverId,
        isVideo: false,
      })
      setCallId(newCallId)
      setIsVideo(false)
      toast.success('Audio call started')
    } catch {
      toast.error('This user is on another call')
    }
  }

  const handleVideoCall = async () => {
    try {
      const newCallId: Id<'calls'> = await startCall({
        conversationId,
        receiverId,
        isVideo: true,
      })
      setCallId(newCallId)
      setIsVideo(true)
      toast.success('Video call started')
    } catch {
      toast.error("You can't make another call right now")
    }
  }

  const handleEndCall = async () => {
    if (!callId) {
      toast.error('No call to end')
      return
    }
    try {
      await endCall({ callId })
      setCallId(null)
      toast.success('Call ended')
    } catch (err) {
      console.error(err)
      toast.error((err as Error).message)
    }
  }

  /* ────────────────────────
     Rendu
  ──────────────────────── */
  return (
    <>
      {/* Barre d’en‑tête */}
      <Card className="w-full p-2 rounded-lg">
        <div className="flex items-center justify-between w-full">
          {/* Info utilisateur */}
          <div className="flex items-center gap-2">
            <Link href="/conversations" className="block lg:hidden">
              <CircleArrowLeft />
            </Link>

            <Avatar className="h-8 w-8">
              <AvatarImage src={imageUrl} />
              <AvatarFallback>{name.substring(0, 1)}</AvatarFallback>
            </Avatar>

            <h2 className="font-semibold truncate">{name}</h2>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="destructive"
              onClick={handleEndCall}
              disabled={!callId}
            >
              <X />
            </Button>

            <Button size="icon" variant="secondary" onClick={handleAudioCall}>
              <Phone />
            </Button>

            <Button size="icon" variant="secondary" onClick={handleVideoCall}>
              <Video />
            </Button>

            {options && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="secondary">
                    <Settings />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  {options.map((option, id) => (
                    <DropdownMenuItem
                      key={id}
                      onClick={option.onClick}
                      className={cn('font-semibold', {
                        'text-destructive': option.destructive,
                      })}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </Card>

      {/* Interface d’appel (affichée uniquement si callId existe) */}
    

      <Toaster richColors />
    </>
  )
}

export default Header
