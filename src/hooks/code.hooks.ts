
export function generateSecureCode(): string {
  const uint32 = new Uint32Array(1);
  crypto.getRandomValues(uint32);
  const code = uint32[0]! % 1000000;
  return code.toString().padStart(6, '0');
}