"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { decode, encode } from "./encoding"
import { EmojiSelector } from "@/components/emoji-selector"
import { ALPHABET_LIST, EMOJI_LIST } from "./emoji"

export function Base64EncoderDecoderContent() {
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
    <CardContent className="space-y-4">
      <p>This tool allows you to encode a hidden message into an emoji or alphabet letter. You can copy and paste text with a hidden message in it to decode the message.</p>

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

      <div className="font-bold text-sm">Pick an emoji</div>
      <EmojiSelector
        onEmojiSelect={handleEmojiSelect}
        selectedEmoji={selectedEmoji}
        emojiList={EMOJI_LIST}
        disabled={!isEncoding}
      />

      <div className="font-bold text-sm">Or pick a standard alphabet letter</div>
      <EmojiSelector
        onEmojiSelect={handleEmojiSelect}
        selectedEmoji={selectedEmoji}
        emojiList={ALPHABET_LIST}
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
  )
}
