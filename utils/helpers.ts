export const cleanJSONString = (str: string): string => {
  return str
    .replace(/\n\s*\/\/[^\n]*/g, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
    .replace(/"\s+"/g, '" "') // Fix spaces between quotes
    .replace(/\[\s*\]/g, '[]') // Clean empty arrays
    .replace(/{\s*}/g, '{}'); // Clean empty objects
};

export const safeParseJSON = (jsonString: string) => {
  if (!jsonString || typeof jsonString !== 'string') return null;
  
  try {
    const cleaned = cleanJSONString(jsonString);
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn('Error parsing JSON:', error);
    return null;
  }
};

export const parseJSONWithComments = (str: string) => {
  if (!str || typeof str !== 'string') return null;
  
  try {
    // Handle both array and object formats
    const cleaned = cleanJSONString(str);
    const parsed = JSON.parse(cleaned);
    
    // If it's an array with a single item, return that item
    if (Array.isArray(parsed) && parsed.length === 1) {
      return parsed[0];
    }
    
    return parsed;
  } catch (e) {
    console.error('Error parsing JSON with comments:', e);
    return safeParseJSON(str);
  }
};