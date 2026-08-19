export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const maxPhoneDigits = 11;

export function normalizePhone(value: string) {
  return value.replace(/\D/g, '').slice(0, maxPhoneDigits);
}

export function formatPhone(value: string) {
  const digits = normalizePhone(value);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function toBrazilianE164(value: string) {
  return `+55${normalizePhone(value)}`;
}

export function isValidEmail(value: string) {
  const email = value.trim().toLowerCase();

  return email.length <= 160 && emailPattern.test(email) && !email.includes('..');
}

export function isValidPhone(value: string) {
  const digits = normalizePhone(value);

  return digits.length >= 10 && digits.length <= maxPhoneDigits && !/^(\d)\1+$/.test(digits);
}

export function isTextFilled(value: string, minLength = 2) {
  return value.trim().length >= minLength;
}

