// Web fallback — Metro uses this file for web builds.
// mixpanel-react-native uses import.meta which Metro's web bundler doesn't support,
// so we return null here and let the HTTP fallback handle analytics on web.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadMixpanel = async (): Promise<any> => {
  return null;
};
