import type { MediaType } from "@/lib/storage/storage";

type UploadResponse = {
  message: string;
  key: string;
  type: MediaType;
};

export async function uploadMedia(
  file: File,
  type: MediaType,
): Promise<UploadResponse> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("type", type);

  const response = await fetch("/api/media/upload", {
    method: "POST",
    body: formData,
  });

  const result: unknown = await response.json();

  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "error" in result &&
      typeof result.error === "string"
        ? result.error
        : "Não foi possível enviar o arquivo.";

    throw new Error(message);
  }

  if (
    typeof result !== "object" ||
    result === null ||
    !("key" in result) ||
    typeof result.key !== "string" ||
    !("type" in result) ||
    result.type !== type
  ) {
    throw new Error("O servidor retornou uma resposta inválida.");
  }

  return result as UploadResponse;
}
