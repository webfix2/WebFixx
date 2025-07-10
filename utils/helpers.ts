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

// User Plan Types
export type UserPlan = 'LEGEND' | 'VETERAN' | 'OG' | 'NEWBEE' | 'FREE';

export interface UserLimits {
  plan: UserPlan;
  description: string;
  badge: string;
  price: number;
  redirectPathLimit: number;
  smtpCheckerLimit: number;
  senderLimit: number;
  verifyLoginLimit: number;
  getCookieLimit: number;
  extractionLimit: number;
  shootContactsLimit: number;
  interactionLimit: number;
}

export const getUserLimits = (appData: any): UserLimits | null => {
  try {
    // Get the user's plan, default to FREE if not set
    const userPlan = appData?.user?.plan || 'FREE';
    console.log('User Plan:', userPlan);

    // Get the limits data from app state
    const limitsData = appData?.data?.limits?.data;
    console.log('Limits Data:', limitsData);
    if (!limitsData || !Array.isArray(limitsData)) return null;

    // Get the headers and create column map
    const headers = appData?.data?.limits?.headers;
    if (!headers || !Array.isArray(headers)) return null;

    // Find the user's plan in the limits data
    const planIndex = headers.indexOf('plan');
    if (planIndex === -1) return null;

    const userLimitRow = limitsData.find(
      (row: any[]) => row[planIndex]?.toString().toUpperCase() === userPlan.toUpperCase()
    );

    if (!userLimitRow) return null;

    // Create a map of column names to their indices
    const getColumnValue = (columnName: string) => {
      const index = headers.indexOf(columnName);
      return index !== -1 ? userLimitRow[index] : null;
    };

    // Return formatted limits object
    return {
      plan: getColumnValue('plan') as UserPlan,
      description: getColumnValue('description')?.toString() || '',
      badge: getColumnValue('badge')?.toString() || '',
      price: Number(getColumnValue('price')) || 0,
      redirectPathLimit: Number(getColumnValue('redirectPathLimit')) || 0,
      smtpCheckerLimit: Number(getColumnValue('smtpCheckerLimit')) || 0,
      senderLimit: Number(getColumnValue('senderLimit')) || 0,
      verifyLoginLimit: Number(getColumnValue('verifyLoginLimit')) || 0,
      getCookieLimit: Number(getColumnValue('getCookieLimit')) || 0,
      extractionLimit: Number(getColumnValue('extractionLimit')) || 0,
      shootContactsLimit: Number(getColumnValue('shootContactsLimit')) || 0,
      interactionLimit: Number(getColumnValue('interactionLimit')) || 0
    };
  } catch (error) {
    console.error('Error getting user limits:', error);
    return null;
  }
};