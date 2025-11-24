// test_des.js
import { encrypt, decrypt } from "./des.js";

console.log("===== TEST DES ECB & CBC =====");

// Sample input
const plaintext = "HELLO WORLD!!";
const key = "PASSWORD";       // must be 8 bytes
const iv = "12345678";        // must be 8 bytes (CBC only)

console.log("\n--- ECB MODE ---");

// Encrypt ECB
const cipherECB = encrypt(plaintext, key, "ecb");
console.log("Ciphertext (ECB):", cipherECB);

// Decrypt ECB
const plainECB = decrypt(cipherECB, key, "ecb");
console.log("Decrypted (ECB):", plainECB);



console.log("\n--- CBC MODE ---");

// Encrypt CBC
const cipherCBC = encrypt(plaintext, key, "cbc", iv);
console.log("Ciphertext (CBC):", cipherCBC);

// Decrypt CBC
const plainCBC = decrypt(cipherCBC, key, "cbc", iv);
console.log("Decrypted (CBC):", plainCBC);



console.log("\n===== RESULT CHECK =====");
console.log("ECB OK?", plainECB === plaintext);
console.log("CBC OK?", plainCBC === plaintext);
