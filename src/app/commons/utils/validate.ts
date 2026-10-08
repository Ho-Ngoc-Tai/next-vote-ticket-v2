import dayjs from "dayjs";

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return false;
  return emailRegex.test(email);
};

// Regex: chỉ chữ hoặc số, đúng 1 dấu chấm, không ở đầu/cuối, không 2 dấu chấm liền nhau
export const nicknameRegex = /^(?!\.)(?!.*\.$)(?!.*\.\.)([a-z0-9]+\.?[a-z0-9]+)$/;

export const isValidDate = (date: string) => {
  if (!date) return false;
  return dayjs(date).isValid();
};
