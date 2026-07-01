// Upptäcker en GFM-fotnotsdefinition (t.ex. "[^1]: ..." i början av en rad).
// En definition är det som gör att renderaren behandlar [^x] som en fotnot, så det
// är rätt signal för att avgöra om innehållet måste hanteras i Källa-läget
// (MDXEditors WYSIWYG stöder inte fotnoter och skulle fela på dem).
const FOOTNOTE_DEFINITION = /^\[\^[^\]\r\n]+\]:/m;

export function containsFootnotes(markdown: string): boolean {
  return FOOTNOTE_DEFINITION.test(markdown);
}
