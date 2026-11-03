import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { MediaType, StorageService } from "./storage";

const STORAGE_ROOT = process.env.MEDIA_STORAGE_PATH;

if (!STORAGE_ROOT) {
  throw new Error("A variável MEDIA_STORAGE_PATH não foi configurada.");
}

const MIME_EXTENSIONS: Record<MediaType, Record<string, string>> = {
  videos: {
    "video/mp4": ".mp4",
  },
  thumbnails: {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  },
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class LocalStorage implements StorageService {
  private readonly root = path.resolve(STORAGE_ROOT!);

  async save(file: File, type: MediaType): Promise<string> {
    const extension = MIME_EXTENSIONS[type][file.type];

    if (!extension) {
      throw new Error(`Formato não permitido para ${type}: ${file.type}`);
    }

    if (file.size === 0) {
      throw new EmptyMediaError();
    }

    const directory = path.join(this.root, type);
    const filename = `${randomUUID()}${extension}`;
    const absolutePath = path.join(directory, filename);
    const key = `${type}/${filename}`;

    await mkdir(directory, { recursive: true });

    try {
      const stream = Readable.fromWeb(
        file.stream() as import("node:stream/web").ReadableStream,
      );

      await pipeline(stream, createWriteStream(absolutePath, { flags: "wx" }));

      return key;
    } catch (error) {
      await rm(absolutePath, { force: true });
      throw error;
    }
  }

  async saveStream(
    source: Readable,
    type: MediaType,
    mimeType: string,
    maxBytes: number,
  ): Promise<string> {
    const extension = MIME_EXTENSIONS[type][mimeType];

    if (!extension) {
      throw new Error(`Formato não permitido para ${type}: ${mimeType}`);
    }

    const directory = path.join(this.root, type);
    const filename = `${randomUUID()}${extension}`;
    const absolutePath = path.join(directory, filename);
    const key = `${type}/${filename}`;

    await mkdir(directory, { recursive: true });

    let bytes = 0;
    const limited = new Transform({
      transform(chunk, _encoding, callback) {
        bytes += chunk.length;

        if (bytes > maxBytes) {
          callback(new MediaTooLargeError());
          return;
        }

        callback(null, chunk);
      },
    });

    try {
      await pipeline(
        source,
        limited,
        createWriteStream(absolutePath, { flags: "wx" }),
      );

      if (bytes === 0) {
        throw new EmptyMediaError();
      }

      return key;
    } catch (error) {
      await rm(absolutePath, { force: true });
      throw error;
    }
  }

  getAbsolutePath(key: string): string {
    const match =
      /^(videos|thumbnails)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.(mp4|jpg|png|webp)$/i.exec(
        key,
      );

    if (!match) {
      throw new Error("Referência de mídia inválida.");
    }

    const [, type, filename, extension] = match;
    const allowedExtensions = Object.values(MIME_EXTENSIONS[type as MediaType]);

    if (!allowedExtensions.includes(`.${extension.toLowerCase()}`)) {
      throw new Error("Extensão inválida para o tipo de mídia.");
    }

    return path.join(this.root, type, `${filename}.${extension.toLowerCase()}`);
  }

  async delete(key: string): Promise<void> {
    await rm(this.getAbsolutePath(key), { force: true });
  }
}

export class EmptyMediaError extends Error {
  constructor() {
    super("Não é possível armazenar um arquivo vazio.");
    this.name = "EmptyMediaError";
  }
}

export class MediaTooLargeError extends Error {
  constructor() {
    super("O arquivo ultrapassa o limite.");
    this.name = "MediaTooLargeError";
  }
}

export const localStorage: StorageService = new LocalStorage();
