import CryptoJS from 'crypto-js';

export const deriveSafeKey = (chatId, passphrase) => {
  return CryptoJS.SHA256(`${chatId}:${passphrase}`).toString();
};

export const encryptText = (plainText, key) => {
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(plainText, key, { iv }).toString();
  return { ciphertext: encrypted, iv: iv.toString() };
};

export const decryptText = (ciphertext, key, iv) => {
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key, { iv: CryptoJS.enc.Hex.parse(iv) });
  return decrypted.toString(CryptoJS.enc.Utf8);
};