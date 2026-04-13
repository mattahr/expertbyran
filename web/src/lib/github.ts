/**
 * Konverterar en raw.githubusercontent.com-URL till motsvarande GitHub API-URL.
 * GitHub API:t har 60s CDN-cache jämfört med 300s för raw.githubusercontent.com,
 * vilket ger snabbare uppdateringar vid forcerad refresh.
 */
export function toGitHubApiUrl(rawUrl: string): string | null {
  const match = rawUrl.match(
    /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/(?:refs\/heads\/)?([^/]+)\/(.+)$/,
  );

  if (!match) return null;

  const [, owner, repo, ref, path] = match;
  return `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;
}
