import { parseISO as _parseISO, format as _format, isValid as _isValid } from "date-fns";

const formatTime = (date: any, format = "HH:mm") => {
  if (!date) return "";

  if (_isValid(date)) return _format(date, format);

  if (_isValid(_parseISO(date))) return _format(_parseISO(`${date}+0000`), format);

  return "";
};

const formatDate = (date: any, format = "dd/MM/yyyy") => {
  if (!date) return "";
  if (_isValid(date)) return _format(date, format);

  if (_isValid(_parseISO(date))) return _format(_parseISO(`${date}+0000`), format);

  return "";
};

const formatDateTime = (date: any, format = "HH:mm dd/MM/yyyy") => {
  if (!date) return "";

  if (_isValid(date)) return _format(date, format);

  if (_isValid(_parseISO(date))) return _format(_parseISO(`${date}+0000`), format);

  return "";
};

export { formatTime, formatDate, formatDateTime };
