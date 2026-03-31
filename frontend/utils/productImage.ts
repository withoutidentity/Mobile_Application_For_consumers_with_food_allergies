const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

const getApiOrigin = () => API_URL.replace(/\/api\/?$/, '');

export const resolveProductImageUri = (imageUrl?: string) => {
  if (!imageUrl) {
    return undefined;
  }

  if (/^(https?:|file:|content:|data:)/i.test(imageUrl)) {
    return imageUrl;
  }

  const origin = getApiOrigin();
  if (!origin) {
    return imageUrl;
  }

  return imageUrl.startsWith('/') ? `${origin}${imageUrl}` : `${origin}/${imageUrl}`;
};
