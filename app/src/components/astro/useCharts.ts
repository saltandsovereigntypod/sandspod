// The charts a person keeps, cast with their settings. Shared by the chart screens.

import { useEffect, useMemo } from 'react';

import { castChart, type Chart, type ChartOptions } from '../../lib/astro/natal';
import { chartOptionsFrom } from '../../lib/astro/prefs';
import { refreshAstro, useAstro, type AstroState } from '../../lib/astro/store';
import type { SavedChart } from '../../lib/astro/vault';
import { useMySettings } from '../../lib/settings/store';

export type CastChart = { saved: SavedChart; chart: Chart | null };

export function useCharts(extra: Partial<ChartOptions> = {}): { astro: AstroState; options: ChartOptions; charts: CastChart[]; mine: CastChart | null } {
  const astro = useAstro();
  const { settings } = useMySettings();
  const key = JSON.stringify(extra);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- key stands in for extra
  const options = useMemo(() => chartOptionsFrom(settings, extra), [settings, key]);
  const charts = useMemo(() => astro.data.charts.map((saved) => ({ saved, chart: castChart(saved.input, options) })), [astro.data, options]);
  useEffect(() => {
    void refreshAstro();
  }, []);
  return { astro, options, charts, mine: charts.find((c) => c.saved.relation === 'me') ?? null };
}
