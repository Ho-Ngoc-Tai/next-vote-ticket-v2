/**
 * Tính số chữ số thập phân có nghĩa của một số
 * Xử lý cả các số rất nhỏ như 0.00005, 0.0005
 */
function getDecimalPlaces(num: number): number {
  if (num === 0 || !isFinite(num)) return 0;
  if (Math.floor(num) === num) return 0;

  // Sử dụng toFixed với số chữ số lớn để tránh scientific notation và đảm bảo độ chính xác
  const str = num.toFixed(20);

  // Tìm vị trí của chữ số khác 0 cuối cùng trong phần thập phân
  const decimalPart = str.split(".")[1];
  if (!decimalPart) return 0;

  let lastNonZero = -1;
  for (let i = decimalPart.length - 1; i >= 0; i--) {
    if (decimalPart[i] !== "0") {
      lastNonZero = i;
      break;
    }
  }

  return lastNonZero + 1;
}

export function formatCurrency(price: number, currency: string, locale = "en") {
  try {
    if (typeof price !== "number") {
      return "";
    }

    const decimalPlaces = getDecimalPlaces(Math.abs(price || 0));
    // Nếu số nguyên thì không hiển thị số thập phân, ngược lại giữ nguyên số chữ số (tối đa 18)
    const formatOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimalPlaces > 0 ? Math.min(decimalPlaces, 18) : 0,
    };

    if (currency === "FARM_POINT_TOKEN" || currency === "VOTC" || currency === "FP") {
      return new Intl.NumberFormat(locale, formatOptions).format(price || 0) + " VOTC";
    }
    if (currency === "GP") {
      return new Intl.NumberFormat(locale, formatOptions).format(price || 0) + " GP";
    }
    if (currency === "USDT") {
      return new Intl.NumberFormat(locale, formatOptions).format(price || 0) + " USDT";
    }
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "VND",
      ...formatOptions,
    }).format(price || 0);
  } catch {
    return "";
  }
}
