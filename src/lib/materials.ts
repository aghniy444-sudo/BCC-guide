/** Display label for an entitlement/material kind (a product id). */
export function materialLabel(kind: string): string {
  const KNOWN: Record<string, string> = {
    guide: 'Guide Book',
    decks: 'Template Deck',
    bundle: 'Bundel',
    free_deck: 'Deck Gratis',
  };
  if (KNOWN[kind]) return KNOWN[kind];
  return kind
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
