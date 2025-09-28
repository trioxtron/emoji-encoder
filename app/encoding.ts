// Variation selectors block https://unicode.org/charts/nameslist/n_FE00.html
// VS1..=VS16
const VARIATION_SELECTOR_START = 0xfe00;
const VARIATION_SELECTOR_END = 0xfe0f;
const NodeRSA = require('node-rsa');

// Variation selectors supplement https://unicode.org/charts/nameslist/n_E0100.html
// VS17..=VS256
const VARIATION_SELECTOR_SUPPLEMENT_START = 0xe0100;
const VARIATION_SELECTOR_SUPPLEMENT_END = 0xe01ef;

export function toVariationSelector(byte: number): string | null {
    if (byte >= 0 && byte < 16) {
        return String.fromCodePoint(VARIATION_SELECTOR_START + byte)
    } else if (byte >= 16 && byte < 256) {
        return String.fromCodePoint(VARIATION_SELECTOR_SUPPLEMENT_START + byte - 16)
    } else {
        return null
    }
}

export function fromVariationSelector(codePoint: number): number | null {
    if (codePoint >= VARIATION_SELECTOR_START && codePoint <= VARIATION_SELECTOR_END) {
        return codePoint - VARIATION_SELECTOR_START
    } else if (codePoint >= VARIATION_SELECTOR_SUPPLEMENT_START && codePoint <= VARIATION_SELECTOR_SUPPLEMENT_END) {
        return codePoint - VARIATION_SELECTOR_SUPPLEMENT_START + 16
    } else {
        return null
    }
}

export function encode(emoji: string, text: string, key: string): string {
    // Encrypt the message if a key is provided
    if (key.length > 0) {
        const pubKey = new NodeRSA();
        pubKey.importKey(key, 'pkcs8-public-pem');
        text = pubKey.encrypt(text, 'base64');
    }

    // convert the string to utf-8 bytes
    const bytes = new TextEncoder().encode(text)
    let encoded = emoji

    for (const byte of bytes) {
        encoded += toVariationSelector(byte)
    }

    return encoded
}

export function decode(text: string, key: string): string {
    let decoded = []
    const chars = Array.from(text)

    for (const char of chars) {
        const byte = fromVariationSelector(char.codePointAt(0)!)

        if (byte === null && decoded.length > 0) {
            break
        } else if (byte === null) {
            continue
        }

        decoded.push(byte)
    }

    let decodedArray = new Uint8Array(decoded)
    const response = new TextDecoder().decode(decodedArray)

    if (key.length > 0) {
        const privKey = new NodeRSA();
        privKey.importKey(key, 'pkcs1-private-pem');
        const decrypted = privKey.decrypt(response, 'utf8');
        return decrypted;
    }
    return response;
}
