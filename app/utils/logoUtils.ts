export const getLogoUrl = (domain: string, mxRecord?: string) => {
  try {
    if (mxRecord) {
      const mxData = typeof mxRecord === 'string' ? JSON.parse(mxRecord) : mxRecord;
      if (mxData && mxData.loginPage) {
        return `https://logo.clearbit.com/${mxData.loginPage}`;
      }
    }
    // Remove protocol and path, just get domain
    const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
    return `https://logo.clearbit.com/${cleanDomain}`;
  } catch (error) {
    // Remove protocol and path, just get domain
    const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
    return `https://logo.clearbit.com/${cleanDomain}`;
  }
};