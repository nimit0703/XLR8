export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString();
};

// export const sleep = (ms: number): Promise<void> => {
//   return new Promise(resolve => setTimeout(resolve, ms));
// };

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};