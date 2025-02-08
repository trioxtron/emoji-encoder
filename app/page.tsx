"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { decode, encode } from "./encoding"
import { EmojiSelector } from "@/components/emoji-selector"
import { EMOJI_LIST } from "./emoji"

export default function Base64EncoderDecoder() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Read input state from URL parameters
  const mode = searchParams.get("mode") || "encode"
  const inputText = searchParams.get("input") || ""
  const selectedEmoji = searchParams.get("emoji") || "😀"

  // Store output state locally
  const [outputText, setOutputText] = useState("")
  const [errorText, setErrorText] = useState("")

  // Update URL when input state changes
  const updateURL = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    router.replace(`?${params.toString()}`)
  }

  // Convert input whenever it changes
  useEffect(() => {
    try {
      const isEncoding = mode === "encode"
      const output = isEncoding ? encode(selectedEmoji, inputText) : decode(inputText)
      setOutputText(output)
      setErrorText("")
    } catch (e) {
      setOutputText("")
      setErrorText(`Error ${mode === "encode" ? "encoding" : "decoding"}: Invalid input`)
    }
  }, [mode, selectedEmoji, inputText])

  const handleModeToggle = (checked: boolean) => {
    const newMode = checked ? "encode" : "decode"
    const params = {
      mode: newMode,
      input: ""
    }
    updateURL(newMode === "decode" ? params : { ...params, emoji: "" })
  }

  const handleEmojiSelect = (emoji: string) => {
    updateURL({ emoji })
  }

  const handleInputChange = (value: string) => {
    updateURL({ input: value })
  }

  // Handle initial URL state
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (!params.has("mode")) {
      updateURL({ mode: "encode" })
    }
  }, [])

  const isEncoding = mode === "encode"

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Encode Anything as an Emoji</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This tool allows you to encode a hidden message into an emoji. You can copy and paste an emoji with a hidden message in it to decode the message.</p>

          <div className="flex items-center justify-center space-x-2">
            <Label htmlFor="mode-toggle">Decode</Label>
            <Switch id="mode-toggle" checked={isEncoding} onCheckedChange={handleModeToggle} />
            <Label htmlFor="mode-toggle">Encode</Label>
          </div>

          <Textarea
            placeholder={isEncoding ? "Enter text to encode" : "Paste an emoji to decode"}
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            className="min-h-[100px]"
          />

          <EmojiSelector
            onEmojiSelect={handleEmojiSelect}
            selectedEmoji={selectedEmoji}
            emojiList={EMOJI_LIST}
            disabled={!isEncoding}
          />

          <Textarea
            placeholder={`${isEncoding ? "Encoded" : "Decoded"} output`}
            value={outputText}
            readOnly
            className="min-h-[100px]"
          />

          {errorText && <div className="text-red-500 text-center">{errorText}</div>}
        </CardContent>
      </Card>
    </div>
  )
}
