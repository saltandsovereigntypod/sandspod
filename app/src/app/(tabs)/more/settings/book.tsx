import { Chips, MenuList, Section, SwitchRow } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { PAGE_FONT_OPTIONS } from '../../../../lib/settings/defaults';

type Font = (typeof PAGE_FONT_OPTIONS)[number]['value'];

export default function BookSettings() {
  return (
    <SettingsForm title="Book of Shadows">
      {(draft, set) => (
        <>
          <MenuList>
            <SwitchRow
              label="Mundane mode by default"
              detail="Open your Book of Shadows in plain, everyday language."
              value={draft.default_mundane_mode}
              onChange={(v) => set('default_mundane_mode', v)}
            />
            <SwitchRow
              label="Add Traditional Library pages"
              detail="Keep Traditional Reference Library pages in your Book of Shadows on the website."
              value={draft.sync_traditional_library_to_grimoire}
              onChange={(v) => set('sync_traditional_library_to_grimoire', v)}
              last
            />
          </MenuList>
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
