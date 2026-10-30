import type { Readable } from "node:stream";

export type MediaType = "videos" | "thumbnails";

export interface StorageService {
  save(file: File, type: MediaType): Promise<string>;
  saveStream(
    source: Readable,
    type: MediaType,
    mimeType: string,
    maxBytes: number,
  ): Promise<string>;
  getAbsolutePath(key: string): string;
  delete(key: string): Promise<void>;
}
