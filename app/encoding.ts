export function encode(emoji: string, text: string): string {
    // convert the string to utf-8 bytes
    const bytes = new TextEncoder().encode(text)
    let encoded = emoji

    for (const char of bytes) {
        const upper = char >> 4
        const lower = char & 0b1111
        encoded += String.fromCodePoint(upper + 0xfe00, lower + 0xfe00)
    }

    return encoded
}

export function decode(text: string): string {
    let decoded = []
    
    for (let i = 2; i < text.length; i += 2) {
        const upper = text.charCodeAt(i) - 0xfe00
        const lower = text.charCodeAt(i + 1) - 0xfe00

        if (upper < 0 || upper > 15 || lower < 0 || lower > 15) {
            break;
        }

        decoded.push((upper << 4) | lower)
    }

    let decodedArray = new Uint8Array(decoded)
    return new TextDecoder().decode(decodedArray)
}
