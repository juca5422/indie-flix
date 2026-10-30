import type { MediaType } from "@/lib/storage/storage";

type UploadResponse = {
  message: string;
  key: string;
  type: MediaType;
};

function readUploadError(result: unknown): string {
  if (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    typeof result.error === "string"
  ) {
    return result.error;
  }

  return "Não foi possível enviar o arquivo.";
}

function isUploadResponse(
  result: unknown,
  type: MediaType,
): result is UploadResponse {
  return (
    typeof result === "object" &&
    result !== null &&
    "key" in result &&
    typeof result.key === "string" &&
    "type" in result &&
    result.type === type
  );
}

// fetch() não expõe o progresso do envio. XMLHttpRequest informa,
// em upload.onprogress, quantos bytes já saíram do navegador.
export function uploadMedia(
  file: File,
  type: MediaType,
  onProgress?: (percent: number) => void,
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();

    formData.append("type", type);
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/media/upload");
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable || event.total === 0) return;

      const percent = Math.min(
        100,
        Math.round((event.loaded / event.total) * 100),
      );

      onProgress(percent);
    };

    xhr.onerror = () => {
      reject(new Error("Não foi possível enviar o arquivo."));
    };

    xhr.onabort = () => {
      reject(new Error("O envio do arquivo foi cancelado."));
    };

    xhr.onload = () => {
      const result: unknown = xhr.response;

      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(readUploadError(result)));
        return;
      }

      if (!isUploadResponse(result, type)) {
        reject(new Error("O servidor retornou uma resposta inválida."));
        return;
      }

      onProgress?.(100);
      resolve(result);
    };

    xhr.send(formData);
  });
}
