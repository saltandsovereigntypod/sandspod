// Row shapes for the website's Book of Shadows tables (Supabase, public schema).
// Every table is protected by row-level security: people only see their own rows.

export type BookRow = {
  id: string;
  title: string;
  created_at: string | null;
  updated_at: string | null;
};

export type SectionRow = {
  id: string;
  book_id: string;
  title: string;
  sort_order: number | null;
  created_at: string | null;
};

export type PageType = 'blank' | 'ritual' | 'ritual_journal' | 'apothecary' | (string & {});

export type PageRow = {
  id: string;
  book_id: string;
  section_id: string | null;
  title: string;
  page_type: PageType | null;
  sort_order: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
};

export type BlockType =
  | 'text'
  | 'heading'
  | 'quote'
  | 'callout'
  | 'divider'
  | 'checklist'
  | 'bulleted_list'
  | 'numbered_list'
  | 'ingredient_list'
  | 'correspondence'
  | 'image'
  | 'page_link'
  | (string & {});

export type BlockRow = {
  id: string;
  page_id: string;
  block_type: BlockType;
  content: string | null;
  rich_content: { html?: string } | null;
  metadata: Record<string, unknown> | string | null;
  sort_order: number | null;
  created_at: string | null;
};

export type PageLinkRow = {
  id: string;
  source_page_id: string;
  target_page_id: string;
  link_label: string | null;
};

/** Everything needed to show one person's grimoire, cached as one unit. */
export type GrimoireSnapshot = {
  fetchedAt: string;
  books: BookRow[];
  sections: SectionRow[];
  pages: PageRow[];
  blocks: BlockRow[];
  links: PageLinkRow[];
};
