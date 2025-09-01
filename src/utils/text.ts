export const normalize = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ') 
    .trim();

export const tokenize = (text: string): string[] =>
  normalize(text).split(' ');
