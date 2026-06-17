/**
 * File Upload Validators
 * Ensures security and data integrity for campaign CSV uploads
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sizeKB?: number;
  mimeType?: string;
  extension?: string;
}

// Constants
export const FILE_CONSTRAINTS = {
  MAX_SIZE_KB: 100,
  MAX_SIZE_BYTES: 100 * 1024, // 100KB fallback
  ALLOWED_EXTENSIONS: ['csv'],
  ALLOWED_MIME_TYPES: [
    'text/csv',
    'text/plain',
    'application/csv',
    'application/x-csv',
    'application/vnd.ms-excel'
  ],
  FORBIDDEN_PATTERNS: [
    /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|zip|rar|7z)$/i,
    /\.(php|asp|aspx|jsp|py|pl|rb|sh)$/i,
    /\.(html|htm|xml|svg|xsl)$/i,
    /<script[\s>]/i,
    /<embed[\s>]/i,
    /<iframe[\s>]/i
  ]
};

/**
 * Validates file size
 */
export function validateFileSize(file: File, maxSizeKB?: number): FileValidationResult {
  const sizeKB = file.size / 1024;
  const limitKB = maxSizeKB || FILE_CONSTRAINTS.MAX_SIZE_KB;
  const limitBytes = limitKB * 1024;

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty. Please upload a CSV file with at least one row of data.',
      sizeKB: 0
    };
  }

  if (file.size > limitBytes) {
    return {
      valid: false,
      error: `File is too large (${sizeKB.toFixed(1)}KB). Maximum size is ${limitKB}KB.`,
      sizeKB
    };
  }

  return { valid: true, sizeKB };
}

/**
 * Validates file extension
 */
export function validateFileExtension(filename: string): FileValidationResult {
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  if (!extension) {
    return {
      valid: false,
      error: 'File has no extension. Only .csv files are allowed.',
      extension
    };
  }

  if (!FILE_CONSTRAINTS.ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File type ".${extension}" is not allowed. Only .csv files are accepted.`,
      extension
    };
  }

  return { valid: true, extension };
}

/**
 * Validates file MIME type
 */
export function validateFileMimeType(file: File): FileValidationResult {
  const mimeType = file.type.toLowerCase();

  if (!mimeType) {
    // Allow files with no MIME type if extension is valid
    return { valid: true, mimeType: 'unknown' };
  }

  if (!FILE_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid file type: ${mimeType}. Only CSV files are accepted.`,
      mimeType
    };
  }

  return { valid: true, mimeType };
}

/**
 * Scans file content for malicious patterns
 */
export async function validateFileContent(file: File): Promise<FileValidationResult> {
  try {
    const content = await file.text();

    // Check for forbidden patterns
    for (const pattern of FILE_CONSTRAINTS.FORBIDDEN_PATTERNS) {
      if (pattern.test(content)) {
        return {
          valid: false,
          error: 'File contains potentially malicious content. Only plain CSV data is allowed.'
        };
      }
    }

    // Check for excessive special characters (potential encoding attack)
    const specialCharRatio = (content.match(/[^\x20-\x7E\n\r,]/g) || []).length / content.length;
    if (specialCharRatio > 0.3) {
      // Allow some special chars for international data, but flag extreme cases
      if (specialCharRatio > 0.7) {
        return {
          valid: false,
          error: 'File contains too many unusual characters. Please upload a valid UTF-8 CSV file.'
        };
      }
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Main validator: Checks all constraints
 */
export async function validateCampaignCSV(file: File, maxSizeKB?: number): Promise<FileValidationResult> {
  // 1. Check file size
  const sizeCheck = validateFileSize(file, maxSizeKB);
  if (!sizeCheck.valid) return sizeCheck;

  // 2. Check extension
  const extensionCheck = validateFileExtension(file.name);
  if (!extensionCheck.valid) return extensionCheck;

  // 3. Check MIME type
  const mimeCheck = validateFileMimeType(file);
  if (!mimeCheck.valid) return mimeCheck;

  // 4. Scan content for malicious patterns
  const contentCheck = await validateFileContent(file);
  if (!contentCheck.valid) return contentCheck;

  return {
    valid: true,
    sizeKB: file.size / 1024,
    mimeType: file.type,
    extension: file.name.split('.').pop()?.toLowerCase()
  };
}

/**
 * Validates file before sending to backend
 * Returns user-friendly error message or null if valid
 */
export async function checkFileBeforeUpload(file: File, maxSizeKB?: number): Promise<string | null> {
  const result = await validateCampaignCSV(file, maxSizeKB);
  return result.valid ? null : result.error || 'Unknown validation error';
}
