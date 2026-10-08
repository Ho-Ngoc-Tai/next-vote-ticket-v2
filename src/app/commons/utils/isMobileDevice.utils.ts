export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Biểu thức chính quy kiểm tra các từ khóa của thiết bị di động
  // Bao gồm: Android, iOS (iPhone/iPad/iPod), BlackBerry, Windows Phone
  return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
};
