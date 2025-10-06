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

export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    const keyPair = await crypto.subtle.generateKey(
        { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
        true,
        ["encrypt", "decrypt"]
    );

    const [spki, pkcs8] = await Promise.all([
        crypto.subtle.exportKey("spki", keyPair.publicKey),
        crypto.subtle.exportKey("pkcs8", keyPair.privateKey),
    ]);

    const toPem = (b: ArrayBuffer, header: string, footer: string) => {
        const raw = String.fromCharCode(...new Uint8Array(b));
        const b64 = btoa(raw);
        const body = b64.replace(/.{1,64}/g, '$&\n');
        return `${header}\n${body}\n${footer}`;
    };

    return {
        publicKey: toPem(spki, "-----BEGIN PUBLIC KEY-----", "-----END PUBLIC KEY-----"),
        privateKey: toPem(pkcs8, "-----BEGIN PRIVATE KEY-----", "-----END PRIVATE KEY-----"),
    };
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
        privKey.importKey(key, 'pkcs8-private-pem');
        const decrypted = privKey.decrypt(response, 'utf8');
        return decrypted;
    }
    return response;
}
