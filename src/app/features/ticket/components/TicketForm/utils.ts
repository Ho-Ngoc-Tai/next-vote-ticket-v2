export const hasContent = (html: string): boolean => {
  const textContent = html.replace(/<[^>]*>/g, "").trim();
  return textContent.length > 0;
};

export const validateFile = (
  file: File,
  options: {
    maxSize: number;
    acceptedTypes: string[];
    maxCount: number;
    currentCount: number;
    onError: (message: string) => void;
  }
): boolean => {
  const { maxSize, acceptedTypes, maxCount, currentCount, onError } = options;

  if (file.size > maxSize) {
    onError(`File ${file.name} exceeds ${maxSize / 1024 / 1024}MB limit`);
    return false;
  }

  const isAccepted = acceptedTypes.some((type) => {
    if (type.endsWith("/*")) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });

  if (!isAccepted) {
    onError(`File ${file.name} is not a supported type`);
    return false;
  }

  if (currentCount >= maxCount) {
    onError(`Cannot add more than ${maxCount} files`);
    return false;
  }

  return true;
};
