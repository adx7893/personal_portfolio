const MAX_CHARS_PER_BLOCK = 20_000;

export const normalizeText = (input) => {
  if (!input || typeof input !== 'string') return '';

  return input
    .replace(/\r/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ')
    .trim();
};

export const sanitizeInput = (input, maxChars = 50_000) => {
  const normalized = normalizeText(input);
  if (!normalized) return '';

  const noTags = normalized.replace(/<[^>]*>/g, ' ');
  const collapsed = noTags.replace(/[{}[\]$\\]/g, ' ');
  return collapsed.slice(0, maxChars).trim();
};

export const truncateForModel = (input, maxChars = MAX_CHARS_PER_BLOCK) => {
  if (!input) return '';
  if (input.length <= maxChars) return input;
  return `${input.slice(0, maxChars)}\n\n[TRUNCATED FOR LENGTH]`;
};
