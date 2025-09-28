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

  // Read mode from URL parameters, other state stored locally
  const mode = searchParams.get("mode") || "encode"
  const [encryptMode, setEncryptMode] = useState(false)
  const [inputText, setInputText] = useState("")
  const [key, setKey] = useState("")
  const [selectedEmoji, setSelectedEmoji] = useState("😀")
  const [outputText, setOutputText] = useState("")
  const [errorText, setErrorText] = useState("")

  // Update URL when mode changes
  const updateMode = (newMode: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("mode", newMode)
    router.replace(`?${params.toString()}`)
  }

  // Convert input whenever it changes
  useEffect(() => {
    try {
      const isEncoding = mode === "encode"
      const output = isEncoding ? encode(selectedEmoji, inputText, key) : decode(inputText, key)
      setOutputText(output)
      setErrorText("")
    } catch (e) {
      setOutputText("")
      setErrorText(`Error ${mode === "encode" ? "encoding" : "decoding"}: Invalid input`)
    }
  }, [mode, selectedEmoji, inputText, key])

  const handleModeToggle = (checked: boolean) => {
    updateMode(checked ? "encode" : "decode")
    setInputText("") // Clear input text when mode changes
  }

  const handleEncryptToggle = () => {
    setEncryptMode(!encryptMode)
    setKey("") // Clear key when toggling encryption
  }

  // Handle initial URL state
  useEffect(() => {
    if (!searchParams.has("mode")) {
      updateMode("encode")
    }
  }, [searchParams, updateMode])

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
        onChange={(e) => setInputText(e.target.value)}
        className="min-h-[100px]"
      />

      <div className="flex flex-col items-center justify-center space-x-2">
          <p>Encryption</p>
          <Switch id="mode-toggle" checked={encryptMode} onCheckedChange={handleEncryptToggle} />
      </div>

      {encryptMode && (
          <Textarea
            placeholder={isEncoding ? "Enter public key to encode" : "Enter private key to decode"}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="min-h-[100px]"
          />
      )}

      <div className="font-bold text-sm">Pick an emoji</div>
      <EmojiSelector
        onEmojiSelect={setSelectedEmoji}
        selectedEmoji={selectedEmoji}
        emojiList={EMOJI_LIST}
        disabled={!isEncoding}
      />

      <div className="font-bold text-sm">Or pick a standard alphabet letter</div>
      <EmojiSelector
        onEmojiSelect={setSelectedEmoji}
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
