export async function fetchWikiDescription(wikiData: string): Promise<string> {
  const description: string = `Descrition de ${wikiData}`
  return description
}
