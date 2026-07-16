// Aucun produit pré-créé : c'est le propriétaire qui les ajoute depuis son
// interface. Le catalogue visiteur reflète uniquement ce qui a été ajouté
// pendant la session (mode mock) ou réellement en base (mode réel).
export const mockProducts = [];

export function getMockProduct(idOrSlug, items = mockProducts) {
  return items.find((p) => p.id === Number(idOrSlug) || p.slug === idOrSlug);
}
