// What one thing on a chart means: a planet or point in its sign and house,
// a house, or an aspect. Used under the wheel, in the placements list and
// the aspect grid, each with its own Simple · Detailed switch.

import { Text, View } from 'react-native';

import { aspectDef, type AspectHit } from '../../lib/astro/aspects';
import { term, termIdFor } from '../../lib/astro/glossary';
import { ordinalHouse } from '../../lib/astro/interpret/compose';
import { aspectReading, houseMeaning, inHouse, inSign, transitReading } from '../../lib/astro/interpret/registry';
import { PLANET_RULES, SIGN_STYLE } from '../../lib/astro/meanings';
import { formatDegree, positionOf, type Chart, type Position } from '../../lib/astro/natal';
import { decanOf, DIGNITY_LABEL, MODERN_RULER, SIGNS, TRADITIONAL_RULER } from '../../lib/astro/signs';
import { type } from '../../theme';
import { ExplainCard, TermText } from './Explain';

const COMING = 'The full reading for this placement is still being written. Meanwhile, tap the words below to learn what each part means.';

export function PositionDetail({ position: p, chart, label }: { position: Position; chart: Chart; label?: string }) {
  const signReading = inSign(p.point, p.sign);
  const houseReading = p.house ? inHouse(p.point, p.house) : null;
  const words = (PLANET_RULES as Record<string, string>)[p.point];
  const decan = decanOf(p.longitude);
  const terms = [termIdFor(p.point), termIdFor(p.sign), ...(p.house ? [`house-${p.house}`] : []), ...(p.dignity ? [p.dignity] : []), ...(p.retrograde ? ['retrograde'] : [])].filter((id) => !!term(id));
  const facts = [
    formatDegree(p),
    p.house ? `${ordinalHouse(p.house)}${chart.solarCusps && !chart.houses ? ' (solar chart)' : ''}` : null,
    p.retrograde ? 'retrograde' : null,
    p.dignity ? DIGNITY_LABEL[p.dignity] : null,
    `decan ${decan.decan} (${decan.ruler})`,
  ].filter(Boolean);
  return (
    <View style={{ gap: 12 }}>
      <ExplainCard
        eyebrow={label ?? facts.join(' · ')}
        title={p.point === 'Ascendant' ? `${p.sign} rising` : `${p.point} in ${p.sign}`}
        reading={signReading}
        entry={signReading ? null : term(termIdFor(p.point))}
        terms={terms}
      >
        {!signReading && (
          <TermText
            style={type.caption}
            text={words ? `${p.point} (${words}) works ${SIGN_STYLE[p.sign]} in ${p.sign}. ${COMING}` : COMING}
          />
        )}
      </ExplainCard>
      {p.house && p.point !== 'Ascendant' && (
        <ExplainCard title={`In the ${ordinalHouse(p.house)}`} reading={houseReading} entry={houseReading ? null : term(`house-${p.house}`)} terms={[`house-${p.house}`]}>
          {!houseReading && <TermText style={type.caption} text={`${p.point} brings its themes into ${houseMeaning(p.house).keywords.slice(0, 4).join(', ')}.`} />}
        </ExplainCard>
      )}
    </View>
  );
}

export function HouseDetail({ house, chart }: { house: number; chart: Chart }) {
  const cusps = chart.houses?.cusps ?? chart.solarCusps;
  const h = houseMeaning(house);
  const sign = cusps ? SIGNS[Math.floor(cusps[house - 1] / 30) % 12] : null;
  const inside = chart.positions.filter((p) => p.house === house && !['Ascendant', 'Midheaven', 'Descendant', 'IC'].includes(p.point));
  const ruler = sign ? TRADITIONAL_RULER[sign] : null;
  const rulerAt = ruler ? positionOf(chart, ruler) : null;
  return (
    <ExplainCard eyebrow={`House ${house}`} title={h.name} reading={{ simple: h.simple, detailed: h.detailed, magic: h.magic }} terms={[`house-${house}`, ...(sign ? [termIdFor(sign)] : [])]}>
      {sign && (
        <TermText
          style={type.body}
          text={`${sign} is on its cusp, so ${ruler}${MODERN_RULER[sign] !== ruler ? ` (and in modern astrology ${MODERN_RULER[sign]})` : ''} rules it${rulerAt ? `; ${ruler} sits in ${rulerAt.sign}${rulerAt.house ? `, the ${ordinalHouse(rulerAt.house)}` : ''}` : ''}. ${inside.length ? `Here: ${inside.map((p) => p.point).join(', ')}.` : 'No planet is here; read it through its cusp and ruler.'}`}
        />
      )}
    </ExplainCard>
  );
}

export function AspectDetail({ aspect: a, transit }: { aspect: AspectHit; transit?: boolean }) {
  const def = aspectDef(a.aspect);
  const reading = transit ? transitReading(a.a, a.aspect, a.b) : aspectReading(a.a, a.aspect, a.b);
  const tone = def.tone === 'soft' ? 'an easy flow between them' : def.tone === 'hard' ? 'friction that asks for effort and grows strength' : def.tone === 'blend' ? 'the two acting as one' : 'a subtle link';
  return (
    <ExplainCard
      eyebrow={`${a.orb.toFixed(1)}° from exact${a.applying === null ? '' : a.applying ? ', applying' : ', separating'}`}
      title={`${transit ? 'Transiting ' : ''}${a.a} ${def.symbol} ${transit ? 'natal ' : ''}${a.b}`}
      reading={reading}
      entry={reading ? null : term(a.aspect)}
      terms={[termIdFor(a.a), a.aspect, termIdFor(a.b), 'orb']}
    >
      {!reading && (
        <TermText
          style={type.caption}
          text={`${a.a} (${(PLANET_RULES as Record<string, string>)[a.a] ?? a.a}) and ${a.b} (${(PLANET_RULES as Record<string, string>)[a.b] ?? a.b}) make a ${a.aspect} (${def.angle}°): ${tone}.`}
        />
      )}
    </ExplainCard>
  );
}

export function ComingSoonNote() {
  return <Text style={type.caption}>{COMING}</Text>;
}
