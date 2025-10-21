export interface Template {
  templateId: string;
  renewal: string; // Assuming renewal is a string that can be parsed to float
  // Add other properties as they become clear from usage
  [key: string]: any; // Allow for other properties not explicitly defined
}
