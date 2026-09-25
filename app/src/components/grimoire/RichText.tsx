import { Linking, Text, type StyleProp, type TextStyle } from 'react-native';

import { parseRichText } from '../../lib/grimoire/richText';
import { fonts } from '../../theme';

type Props = { source: string; style?: StyleProp<TextStyle>; linkColor: string };

/** Renders the website's stored block text (plain or sanitized HTML). */
export function RichText({ source, style, linkColor }: Props) {
  const runs = parseRichText(source);
  return (
    <Text style={style}>
      {runs.map((run, i) => (
        <Text
          key={i}
          style={[
            run.bold && { fontFamily: fonts.bodySemi },
            run.italic && { fontStyle: 'italic' },
            (run.underline || run.href) && { textDecorationLine: 'underline' },
            run.href && { color: linkColor },
          ]}
          accessibilityRole={run.href ? 'link' : undefined}
          onPress={run.href ? () => Linking.openURL(run.href!) : undefined}
        >
          {run.text}
        </Text>
      ))}
    </Text>
  );
}
