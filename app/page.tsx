"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { decode, encode } from "./encoding"
import { EmojiSelector } from "@/components/emoji-selector"
import { EMOJI_LIST } from "./emoji"

export default function Base64EncoderDecoder() {
  const [input, setInput] = useState("")
  const [emoji, setEmoji] = useState("😀")
  const [output, setOutput] = useState("")
  const [isEncoding, setIsEncoding] = useState(true)
  const [error, setError] = useState("")

  const handleConvert = () => {
    try {
      if (isEncoding) {
        setOutput(encode(emoji, input))
      } else {
        setOutput(decode(input))
      }
      setError("")
    } catch (e) {
      setError(`Error ${isEncoding ? "encoding" : "decoding"}: Invalid input`)
    }
  }

  const handleModeToggle = (checked: boolean) => {
    setIsEncoding(checked)
    setInput("")
    setOutput("")
    setError("")
  }

  const handleEmojiSelect = (emoji: string) => {
    setEmoji(emoji)
  }

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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px]"
          />

          <EmojiSelector onEmojiSelect={handleEmojiSelect} selectedEmoji={emoji} emojiList={EMOJI_LIST} disabled={!isEncoding} />

          <Button
            onClick={handleConvert}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isEncoding ? "Encode" : "Decode"}
          </Button>

          <Textarea
            placeholder={`${isEncoding ? "Encoded" : "Decoded"} output`}
            value={output}
            readOnly
            className="min-h-[100px]"
          />

          {error && <div className="text-red-500 text-center">{error}</div>}
        </CardContent>
      </Card>
    </div>
  )
}

