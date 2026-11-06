import { View } from 'react-native';

import { Body, Card, SectionLabel, ui } from '../rituals/ui';

export type ReadingBlock = { title: string; paragraphs: string[] };

/**
 * A composed reading laid out by its sections. A section that is a list of
 * blocks (the shapes, the charms) shows each block under its own name.
 */
export function ReadingBody({
  sections,
  blocks,
  blocksId,
}: {
  sections: { id: string; title: string; paragraphs: string[] }[];
  blocks: ReadingBlock[];
  blocksId: string;
}) {
  return (
    <View style={ui.gap}>
      {sections.map((s) => (
        <View key={s.id} style={ui.gapSmall}>
          <SectionLabel>{s.title}</SectionLabel>
          {s.id === blocksId ? (
            blocks.map((b, i) => (
              <Card key={`${b.title}${i}`}>
                <SectionLabel>{b.title}</SectionLabel>
                {b.paragraphs.map((p, j) => (
                  <Body key={j}>{p}</Body>
                ))}
              </Card>
            ))
          ) : (
            s.paragraphs.map((p, i) => (
              <Body key={i} muted={s.id === 'close' && i > 0}>
                {s.id === 'questions' ? `• ${p}` : p}
              </Body>
            ))
          )}
        </View>
      ))}
    </View>
  );
}
