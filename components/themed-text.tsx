import { StyleSheet, Text, type TextProps } from 'react-native';

import { Design } from '@/constants/design';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'black';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'black' ? styles.black : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Design.typography.fontRegular,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Design.typography.fontSemiBold,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: Design.typography.fontBold,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: Design.typography.fontSemiBold,
  },
  link: {
    fontSize: 16,
    color: Design.colors.violet,
    fontFamily: Design.typography.fontMedium,
  },
  black: {
    fontSize: 40,
    fontFamily: Design.typography.fontBlack,
    textTransform: 'uppercase',
  },
});
