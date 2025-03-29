export interface SecuredApiRequest {
    action: string;
    [key: string]: any;
  }
  
  export interface SecuredApiResponse {
    success: boolean;
    data?: any;
    error?: string;
  }