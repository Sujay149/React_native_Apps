// This file is ONLY bundled for iOS/Android (Metro picks .native.ts over .ts).
// It safely imports the native Mixpanel SDK which uses import.meta internally.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadMixpanel = async (): Promise<any> => {
  try {
    const { Mixpanel } = await import('mixpanel-react-native');
    return Mixpanel;
  } catch {
    return null;
  }
};
