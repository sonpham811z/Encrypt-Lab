const encoder = new TextEncoder();
const decoder = new TextDecoder();

const stringToBytes = (str) => {
  return encoder.encode(str);
}

const bytesToString = (bytes) => {
  return decoder.decode(bytes);
}

const hexToBytes = (hex) => {
  if (hex.length % 2 !== 0) throw new Error("Invalid hex string");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

const bytesToHex = (bytes) => {
  let s = "";
  for (let b of bytes) {
    let h = b.toString(16);
    if (h.length === 1) h = "0" + h;
    s += h;
  }
  return s;
}

const concatBytes = (arrays) => {
  let len = 0;
  for (const a of arrays) len += a.length;
  const out = new Uint8Array(len);
  let o = 0;
  for (const a of arrays) {
    out.set(a, o);
    o += a.length;
  }
  return out;
}

const randomBytes = (len) => {
  const arr = new Uint8Array(len);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < len; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  return arr;
}

const pkcs7Pad = (data, blockSize = 16) => {
  const padLen = blockSize - (data.length % blockSize || blockSize);
  const out = new Uint8Array(data.length + padLen);
  out.set(data, 0);
  out.fill(padLen, data.length);
  return out;
}

const pkcs7Unpad = (data, blockSize = 16) => {
  if (data.length === 0 || data.length % blockSize !== 0) {
    throw new Error("Invalid PKCS#7 padded data length");
  }
  const padLen = data[data.length - 1];
  if (padLen <= 0 || padLen > blockSize) {
    throw new Error("Invalid PKCS#7 padding");
  }
  for (let i = data.length - padLen; i < data.length; i++) {
    if (data[i] !== padLen) throw new Error("Invalid PKCS#7 padding bytes");
  }
  return data.slice(0, data.length - padLen);
}

const normalizeKey = (key) => {
  if (typeof key !== "string") {
    throw new Error("Key must be a string");
  }
  // 32 hex chars -> 16 bytes
  if (/^[0-9a-fA-F]{32}$/.test(key)) {
    return hexToBytes(key);
  }
  const bytes = stringToBytes(key);
  if (bytes.length !== 16) {
    throw new Error("AES-128 key must be 16 bytes (16 ASCII chars or 32 hex chars)");
  }
  return bytes;
}

const normalizeIV = (iv) => {
  if (!iv) {
    // caller will decide if IV is optional; here we just signal missing
    return null;
  }
  if (typeof iv !== "string") {
    throw new Error("IV must be a string");
  }
  // hex
  if (/^[0-9a-fA-F]{32}$/.test(iv)) {
    const b = hexToBytes(iv);
    if (b.length !== 16) throw new Error("IV must be 16 bytes");
    return b;
  }
  const bytes = stringToBytes(iv);
  if (bytes.length !== 16) {
    throw new Error("IV must be exactly 16 bytes (16 ASCII chars or 32 hex)");
  }
  return bytes;
}

const sBox = new Uint8Array([
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5,
  0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
  0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0,
  0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
  0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc,
  0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a,
  0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
  0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0,
  0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
  0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b,
  0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85,
  0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
  0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5,
  0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
  0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17,
  0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88,
  0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
  0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c,
  0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
  0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9,
  0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6,
  0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e,
  0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
  0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94,
  0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68,
  0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
]);

const invSBox = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  invSBox[sBox[i]] = i;
}

const RCON = [
  0x00, 0x01, 0x02, 0x04, 0x08,
  0x10, 0x20, 0x40, 0x80, 0x1b, 0x36
];

const xtime = (a) => {
  return ((a << 1) ^ ((a & 0x80) ? 0x1b : 0)) & 0xff;
}

const mul = (a, b) => {
  let res = 0;
  while (b > 0) {
    if (b & 1) res ^= a;
    a = xtime(a);
    b >>= 1;
  }
  return res;
}

const expandKey = (keyBytes) =>  {
  const Nk = 4; 
  const Nb = 4;
  const Nr = 10;
  const w = new Uint8Array(4 * Nb * (Nr + 1)); 

  w.set(keyBytes, 0);

  const temp = new Uint8Array(4);
  let i = Nk;

  while (i < Nb * (Nr + 1)) {
    temp[0] = w[(i - 1) * 4 + 0];
    temp[1] = w[(i - 1) * 4 + 1];
    temp[2] = w[(i - 1) * 4 + 2];
    temp[3] = w[(i - 1) * 4 + 3];

    if (i % Nk === 0) {
      const t = temp[0];
      temp[0] = temp[1];
      temp[1] = temp[2];
      temp[2] = temp[3];
      temp[3] = t;

      temp[0] = sBox[temp[0]];
      temp[1] = sBox[temp[1]];
      temp[2] = sBox[temp[2]];
      temp[3] = sBox[temp[3]];

      temp[0] ^= RCON[i / Nk];
    }

    const prev = (i - Nk) * 4;
    w[i * 4 + 0] = w[prev + 0] ^ temp[0];
    w[i * 4 + 1] = w[prev + 1] ^ temp[1];
    w[i * 4 + 2] = w[prev + 2] ^ temp[2];
    w[i * 4 + 3] = w[prev + 3] ^ temp[3];

    i++;
  }

  return w; // 176 bytes -> 11 round keys
}

const addRoundKey = (state, roundKey, round) => {
  const offset = round * 16;
  for (let i = 0; i < 16; i++) {
    state[i] ^= roundKey[offset + i];
  }
}

const subBytes = (state) => {
  for (let i = 0; i < 16; i++) {
    state[i] = sBox[state[i]];
  }
}

const invSubBytes = (state) => {
  for (let i = 0; i < 16; i++) {
    state[i] = invSBox[state[i]];
  }
}

const shiftRows = (state) => {
  const t1 = state[1];
  state[1] = state[5];
  state[5] = state[9];
  state[9] = state[13];
  state[13] = t1;

  const t2 = state[2];
  const t6 = state[6];
  state[2] = state[10];
  state[6] = state[14];
  state[10] = t2;
  state[14] = t6;

  const t3 = state[3];
  state[3] = state[15];
  state[15] = state[11];
  state[11] = state[7];
  state[7] = t3;
}

const invShiftRows = (state) => {
  const t13 = state[13];
  state[13] = state[9];
  state[9] = state[5];
  state[5] = state[1];
  state[1] = t13;

  const t2 = state[2];
  const t6 = state[6];
  state[2] = state[10];
  state[6] = state[14];
  state[10] = t2;
  state[14] = t6;

  const t3 = state[3];
  state[3] = state[7];
  state[7] = state[11];
  state[11] = state[15];
  state[15] = t3;
}

const mixColumns = (state) => {
  for (let c = 0; c < 4; c++) {
    const i = c * 4;
    const a0 = state[i];
    const a1 = state[i + 1];
    const a2 = state[i + 2];
    const a3 = state[i + 3];

    state[i]     = mul(a0, 2) ^ mul(a1, 3) ^ a2 ^ a3;
    state[i + 1] = a0 ^ mul(a1, 2) ^ mul(a2, 3) ^ a3;
    state[i + 2] = a0 ^ a1 ^ mul(a2, 2) ^ mul(a3, 3);
    state[i + 3] = mul(a0, 3) ^ a1 ^ a2 ^ mul(a3, 2);
  }
}

const invMixColumns = (state)=>  {
  for (let c = 0; c < 4; c++) {
    const i = c * 4;
    const a0 = state[i];
    const a1 = state[i + 1];
    const a2 = state[i + 2];
    const a3 = state[i + 3];

    state[i]     = mul(a0, 0x0e) ^ mul(a1, 0x0b) ^ mul(a2, 0x0d) ^ mul(a3, 0x09);
    state[i + 1] = mul(a0, 0x09) ^ mul(a1, 0x0e) ^ mul(a2, 0x0b) ^ mul(a3, 0x0d);
    state[i + 2] = mul(a0, 0x0d) ^ mul(a1, 0x09) ^ mul(a2, 0x0e) ^ mul(a3, 0x0b);
    state[i + 3] = mul(a0, 0x0b) ^ mul(a1, 0x0d) ^ mul(a2, 0x09) ^ mul(a3, 0x0e);
  }
}

const aesEncryptBlock = (block, roundKey) => {
  const state = new Uint8Array(16);
  state.set(block);

  const Nr = 10;

  addRoundKey(state, roundKey, 0);

  for (let round = 1; round < Nr; round++) {
    subBytes(state);
    shiftRows(state);
    mixColumns(state);
    addRoundKey(state, roundKey, round);
  }

  subBytes(state);
  shiftRows(state);
  addRoundKey(state, roundKey, Nr);

  return state;
}

const aesDecryptBlock = (block, roundKey) => {
  const state = new Uint8Array(16);
  state.set(block);

  const Nr = 10;

  addRoundKey(state, roundKey, Nr);

  for (let round = Nr - 1; round >= 1; round--) {
    invShiftRows(state);
    invSubBytes(state);
    addRoundKey(state, roundKey, round);
    invMixColumns(state);
  }

  invShiftRows(state);
  invSubBytes(state);
  addRoundKey(state, roundKey, 0);

  return state;
}

const encryptECB = (plaintext, keyBytes) => {
  const roundKey = expandKey(keyBytes);
  const data = pkcs7Pad(stringToBytes(plaintext), 16);
  const out = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i += 16) {
    const block = data.slice(i, i + 16);
    const enc = aesEncryptBlock(block, roundKey);
    out.set(enc, i);
  }

  return bytesToHex(out);
}

const decryptECB = (cipherHex, keyBytes) => {
  const roundKey = expandKey(keyBytes);
  const cipher = hexToBytes(cipherHex);
  if (cipher.length % 16 !== 0) {
    throw new Error("Ciphertext must be multiple of 16 bytes in ECB");
  }
  const out = new Uint8Array(cipher.length);

  for (let i = 0; i < cipher.length; i += 16) {
    const block = cipher.slice(i, i + 16);
    const dec = aesDecryptBlock(block, roundKey);
    out.set(dec, i);
  }

  return bytesToString(pkcs7Unpad(out, 16));
}

const encryptCBC = (plaintext, keyBytes, ivStr) => {
  const roundKey = expandKey(keyBytes);
  let ivBytes = normalizeIV(ivStr);
  let prefix = "";

  if (!ivBytes) {
    ivBytes = randomBytes(16);
    prefix = bytesToHex(ivBytes);
  }

  const data = pkcs7Pad(stringToBytes(plaintext), 16);
  const out = new Uint8Array(data.length);

  let prev = ivBytes;

  for (let i = 0; i < data.length; i += 16) {
    const block = data.slice(i, i + 16);
    const xored = new Uint8Array(16);
    for (let j = 0; j < 16; j++) xored[j] = block[j] ^ prev[j];

    const enc = aesEncryptBlock(xored, roundKey);
    out.set(enc, i);
    prev = enc;
  }

  return prefix + bytesToHex(out);
}

const decryptCBC = (cipherHex, keyBytes, ivStr) => {
  const roundKey = expandKey(keyBytes);

  let ivBytes = normalizeIV(ivStr);
  let cipherBytes;

  if (!ivBytes) {
    if (cipherHex.length < 32) throw new Error("Ciphertext too short to contain IV");
    const ivHex = cipherHex.slice(0, 32);
    ivBytes = hexToBytes(ivHex);
    cipherBytes = hexToBytes(cipherHex.slice(32));
  } else {
    cipherBytes = hexToBytes(cipherHex);
  }

  if (cipherBytes.length % 16 !== 0) {
    throw new Error("Ciphertext must be multiple of 16 bytes in CBC");
  }

  const out = new Uint8Array(cipherBytes.length);
  let prev = ivBytes;

  for (let i = 0; i < cipherBytes.length; i += 16) {
    const block = cipherBytes.slice(i, i + 16);
    const decBlock = aesDecryptBlock(block, roundKey);
    const plainBlock = new Uint8Array(16);
    for (let j = 0; j < 16; j++) plainBlock[j] = decBlock[j] ^ prev[j];
    out.set(plainBlock, i);
    prev = block;
  }

  return bytesToString(pkcs7Unpad(out, 16));
}

export const encrypt = (plaintext, key, mode = "ecb", iv) => {
  const keyBytes = normalizeKey(key);
  const m = mode.toLowerCase();

  if (m === "ecb") {
    return encryptECB(plaintext, keyBytes);
  }
  if (m === "cbc") {
    return encryptCBC(plaintext, keyBytes, iv);
  }
  throw new Error(`Unsupported AES mode: ${mode} (use "ecb" or "cbc")`);
}

export const decrypt = (cipherHex, key, mode = "ecb", iv) => {
  const keyBytes = normalizeKey(key);
  const m = mode.toLowerCase();

  if (m === "ecb") {
    return decryptECB(cipherHex, keyBytes);
  }
  if (m === "cbc") {
    return decryptCBC(cipherHex, keyBytes, iv);
  }
  throw new Error(`Unsupported AES mode: ${mode} (use "ecb" or "cbc")`);
}
