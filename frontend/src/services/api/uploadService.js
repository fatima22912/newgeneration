import httpClient from "./httpClient";

// Aide générique pour l'upload de fichiers en multipart/form-data.
// Utilisée par productService pour les images produit ; réutilisable pour
// d'autres uploads futurs (ex. photo de profil).
export async function uploadFile(url, file, fieldName = "file") {
  const formData = new FormData();
  formData.append(fieldName, file);
  const { data } = await httpClient.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
