export type MediaType = "videos" | "thumbnails";

export interface StorageService {
  save(file: File, type: MediaType): Promise<string>;
  getAbsolutePath(key: string): string;
  delete(key: string): Promise<void>;
}