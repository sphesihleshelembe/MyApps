import { StyleSheet } from 'react-native';

export const Typography = {
  headingXL: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.5,
  },
  headingL: {
    fontSize: 26,
    lineHeight: 34,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.3,
  },
  headingM: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: -0.2,
  },
  headingS: {
    fontSize: 17,
    lineHeight: 24,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: -0.1,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Inter-Regular',
    letterSpacing: 0,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
    letterSpacing: 0,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Inter-Medium',
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Inter-Regular',
    letterSpacing: 0.2,
  },
  captionMedium: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Inter-Medium',
    letterSpacing: 0.2,
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.1,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'Inter-Medium',
    letterSpacing: 0.5,
  },
} as const;
