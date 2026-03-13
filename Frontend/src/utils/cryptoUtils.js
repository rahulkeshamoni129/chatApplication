/**
 * KEY SYNCHRONIZATION WORKINGS:
 * 1. The 'Private Key' is extremely sensitive.
 * 2. If the user wants to sync it, we encrypt it using 'AES-GCM' and a 'Secret PIN'.
 * 3. The server gets the 'Encrypted Private Key', but without the PIN, the server is useless.
 */

// Helper: Derive a key from a PIN using PBKDF2
const deriveKeyFromPin = async (pin, salt) => {
    const encoder = new TextEncoder();
    const baseKey = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(pin),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode(salt),
            iterations: 100000,
            hash: "SHA-256"
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
};

/**
 * Encrypts the Private Key using a PIN
 */
export const protectPrivateKey = async (privateKeyStr, pin, userId) => {
    try {
        const salt = userId; // User-specific salt
        const key = await deriveKeyFromPin(pin, salt);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        const encrypted = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            new TextEncoder().encode(privateKeyStr)
        );

        // Store IV + Encrypted Data in Base64
        return `${bufferToBase64(iv)}::${bufferToBase64(encrypted)}`;
    } catch (error) {
        console.error("Failed to protect private key:", error);
        throw error;
    }
};

/**
 * Decrypts the Private Key using a PIN
 */
export const unprotectPrivateKey = async (protectedKeyStr, pin, userId) => {
    try {
        const [ivStr, dataStr] = protectedKeyStr.split("::");
        const salt = userId;
        const key = await deriveKeyFromPin(pin, salt);
        
        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: base64ToBuffer(ivStr) },
            key,
            base64ToBuffer(dataStr)
        );

        return new TextDecoder().decode(decrypted);
    } catch (error) {
        console.error("Incorrect Security PIN or Decryption failed:", error);
        throw new Error("Invalid Security PIN");
    }
};

/**
 * END-TO-END ENCRYPTION (E2EE) WORKINGS:
 * 1. Key Generation: Every user generates a 'Key Pair' (Public + Private).
 * 2. Storage: The Public Key is shared with the server. The Private Key stays ONLY in the user's browser (localStorage).
 * 3. Encryption: When A sends to B, A uses B's Public Key to 'lock' the message.
 * 4. Decryption: Only User B's Private Key can 'unlock' that specific message.
 */

// Helper: Convert ArrayBuffer to Base64
const bufferToBase64 = (buffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

// Helper: Convert Base64 to ArrayBuffer
const base64ToBuffer = (base64) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
};

/**
 * Generates an RSA-OAEP key pair for encryption/decryption
 */
export const generateE2EEKeys = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true, // extractable
        ["encrypt", "decrypt"]
    );

    // Export keys to save them
    const publicKeyBuffer = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKeyBuffer = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    return {
        publicKey: bufferToBase64(publicKeyBuffer),
        privateKey: bufferToBase64(privateKeyBuffer)
    };
};

/**
 * Encrypts a message for BOTH the recipient and the sender.
 * Format: __E2EE__[EncryptedForRecipient]__[EncryptedForSender]
 */
export const encryptMessage = async (message, recipientPublicKeyStr, senderPublicKeyStr) => {
    try {
        if (!recipientPublicKeyStr) return message;

        const encode = (msg) => new TextEncoder().encode(msg);
        
        const encryptWithKey = async (msg, keyStr) => {
            const importedKey = await window.crypto.subtle.importKey(
                "spki",
                base64ToBuffer(keyStr),
                { name: "RSA-OAEP", hash: "SHA-256" },
                false,
                ["encrypt"]
            );
            const buffer = await window.crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                importedKey,
                encode(msg)
            );
            return bufferToBase64(buffer);
        };

        const encForRec = await encryptWithKey(message, recipientPublicKeyStr);
        let encForSen = "NULL"; // Fallback if sender key missing
        
        if (senderPublicKeyStr) {
            encForSen = await encryptWithKey(message, senderPublicKeyStr);
        }

        return `__E2EE__${encForRec}__SEP__${encForSen}`;
    } catch (error) {
        console.error("Encryption failed:", error);
        return message;
    }
};

/**
 * Decrypts a message based on whether the user is the sender or recipient
 */
export const decryptMessage = async (encryptedMessageStr, myPrivateKeyStr, isSender = false) => {
    try {
        if (!encryptedMessageStr.startsWith("__E2EE__")) return encryptedMessageStr;
        if (!myPrivateKeyStr) return "[Key Missing]";

        const parts = encryptedMessageStr.replace("__E2EE__", "").split("__SEP__");
        if (parts.length < 2) return "[Invalid Encrypted Format]";

        // If I am the sender, I use the second part. If recipient, I use the first part.
        const cipherText = isSender ? parts[1] : parts[0];
        if (cipherText === "NULL") return "[Original message not saved for sender]";

        const importedPrivateKey = await window.crypto.subtle.importKey(
            "pkcs8",
            base64ToBuffer(myPrivateKeyStr),
            { name: "RSA-OAEP", hash: "SHA-256" },
            false,
            ["decrypt"]
        );

        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            importedPrivateKey,
            base64ToBuffer(cipherText)
        );

        return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
        console.error("Decryption failed:", error);
        return "[Decryption Error]";
    }
};
