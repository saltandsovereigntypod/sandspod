import { Chips, MenuList, Section, SwitchRow } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { JOURNALS, journalPlace, PLACE_OPTIONS, type JournalPlace } from '../../../../lib/journals/journals';
import { PAGE_FONT_OPTIONS } from '../../../../lib/settings/defaults';

type Font = (typeof PAGE_FONT_OPTIONS)[number]['value'];

export default function BookSettings() {
  return (
    <SettingsForm title="Grimoire">
      {(draft, set) => (
        <>
          <MenuList>
            <SwitchRow
              label="Mundane mode"
              detail="Your Grimoire in plain, everyday language. The same as the Mundane switch at the top of your Grimoire, on every device."
              value={draft.default_mundane_mode}
              onChange={(v) => set('default_mundane_mode', v)}
            />
            <SwitchRow
              label="Add Traditional Library pages"
              detail="Keep Traditional Reference Library pages in your Grimoire on the website."
              value={draft.sync_traditional_library_to_grimoire}
              onChange={(v) => set('sync_traditional_library_to_grimoire', v)}
            />
            <SwitchRow
              label="Show Dreams"
              detail="Keep your dream journal as a section of your Grimoire."
              value={draft.grimoire_show_dreams !== false}
              onChange={(v) => set('grimoire_show_dreams', v)}
              last
            />
          </MenuList>
          {/* Each journal can be a section of the Grimoire or one of its own; moving it keeps every entry. */}
          {JOURNALS.map((j) => (
            <Section key={j.kind} label={`${j.title} journal`}>
              <Chips<JournalPlace> label={`Where your ${j.title.toLowerCase()} journal lives`} options={PLACE_OPTIONS} value={journalPlace(draft, j.kind)} onChange={(v) => set(j.setting, v)} />
            </Section>
          ))}
          <Section label="Page font">
            <Chips
              label="Page font"
              options={PAGE_FONT_OPTIONS}
              value={(draft.grimoire_page_font as Font) || 'classic-serif'}
              onChange={(v) => set('grimoire_page_font', v)}
            />
          </Section>
        </>
      )}
    </SettingsForm>
  );
}
