"use client";

import { Film, Plus, Upload } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { listCategories } from "@/lib/actions/categories";
import { createMovie, updateMovie } from "@/lib/actions/movies";
import { uploadMedia } from "@/lib/media/media";

type CategoryOption = {
  id: string;
  name: string;
};

type EditableMovie = {
  id: string;
  title: string;
  synopsis: string;
  ageRating: "L" | "10" | "12" | "14" | "16" | "18";
  categoryIds: string[];
  videoUrl: string;
  thumbnailUrl: string;
};

type UploadPhase = "idle" | "thumbnail" | "video" | "saving";

interface AddMovieDialogProps {
  mode?: "create" | "edit";
  movie?: EditableMovie;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddMovieDialog({
  mode = "create",
  movie,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: AddMovieDialogProps) {
  const isEditing = mode === "edit";

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;

  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [ageRating, setAgeRating] = useState<EditableMovie["ageRating"]>("L");

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  // Carrega as categorias quando o modal abre.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadCategories() {
      setLoadingCategories(true);
      setCategoryError("");

      try {
        const result = await listCategories();

        if (!cancelled) {
          setCategories(result);
        }
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);

        if (!cancelled) {
          setCategoryError("Não foi possível carregar as categorias.");
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Preenche os campos ao editar ou limpa os campos ao cadastrar.
  useEffect(() => {
    if (!open) return;

    if (isEditing && movie) {
      setTitle(movie.title);
      setSynopsis(movie.synopsis);
      setAgeRating(movie.ageRating);
      setCategoryIds([...movie.categoryIds]);
    } else {
      setTitle("");
      setSynopsis("");
      setAgeRating("L");
      setCategoryIds([]);
    }

    setVideo(null);
    setThumbnail(null);
  }, [open, isEditing, movie]);

  function handleOpenChange(nextOpen: boolean, force = false) {
    if (isSubmitting && !force) return;

    // No modo controlado, o componente pai controla a abertura.
    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);

    if (!nextOpen) {
      setVideo(null);
      setThumbnail(null);
      setCategoryError("");
      setUploadPhase("idle");
      setUploadProgress(0);
    }
  }

  function toggleCategory(categoryId: string) {
    setCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    if (isEditing && !movie) {
      alert("Não foi possível identificar o filme para edição.");
      return;
    }

    if (!isEditing && (!video || !thumbnail)) {
      alert("Selecione o vídeo e a thumbnail.");
      return;
    }

    if (categoryIds.length === 0) {
      alert("Selecione pelo menos uma categoria.");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setUploadPhase("saving");

    try {
      // Na edição, mantém os arquivos atuais se nenhum novo for enviado.
      let videoUrl = isEditing ? movie!.videoUrl : "";
      let thumbnailUrl = isEditing ? movie!.thumbnailUrl : "";

      if (thumbnail) {
        setUploadPhase("thumbnail");
        setUploadProgress(0);
        const uploadedThumbnail = await uploadMedia(
          thumbnail,
          "thumbnails",
          setUploadProgress,
        );
        thumbnailUrl = uploadedThumbnail.key;
      }

      if (video) {
        setUploadPhase("video");
        setUploadProgress(0);
        const uploadedVideo = await uploadMedia(
          video,
          "videos",
          setUploadProgress,
        );
        videoUrl = uploadedVideo.key;
      }

      setUploadPhase("saving");

      const result = isEditing
        ? await updateMovie({
            movieId: movie!.id,
            title,
            synopsis,
            ageRating,
            categoryIds,
            videoUrl,
            thumbnailUrl,
          })
        : await createMovie({
            title,
            synopsis,
            ageRating,
            categoryIds,
            videoUrl,
            thumbnailUrl,
          });

      if (!result.success) {
        throw new Error(result.message);
      }

      alert(result.message);
      handleOpenChange(false, true);
    } catch (error) {
      console.error(
        isEditing ? "Erro ao editar filme:" : "Erro ao cadastrar filme:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o filme.",
      );
    } finally {
      setIsSubmitting(false);
      setUploadPhase("idle");
      setUploadProgress(0);
    }
  }

  const uploadLabel =
    uploadPhase === "thumbnail"
      ? "Enviando a thumbnail"
      : uploadPhase === "video"
        ? uploadProgress >= 100
          ? "Gravando o vídeo no servidor"
          : "Enviando o vídeo para o servidor"
        : "Salvando o filme";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* 
        Quando o modal é controlado externamente, não precisamos
        de um DialogTrigger interno, a menos que um seja fornecido.
        No modo normal, o botão de cadastro continua funcionando.
      */}
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : controlledOpen === undefined ? (
        <DialogTrigger asChild>
          <Button>
            {isEditing ? (
              <Film className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {isEditing ? "Editar filme" : "Adicionar vídeo"}
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar filme" : "Adicionar filme"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Atualize os dados do filme. Ao salvar, ele será enviado novamente para análise."
              : "Preencha os dados do filme e selecione os arquivos para cadastro."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="movie-title">Título *</Label>
            <Input
              id="movie-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="movie-synopsis">Sinopse *</Label>
            <Textarea
              id="movie-synopsis"
              value={synopsis}
              onChange={(event) => setSynopsis(event.target.value)}
              maxLength={5000}
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="movie-age-rating">Classificação indicativa *</Label>

            <Select
              value={ageRating}
              onValueChange={(value) =>
                setAgeRating(value as EditableMovie["ageRating"])
              }
              disabled={isSubmitting}
            >
              <SelectTrigger id="movie-age-rating">
                <SelectValue placeholder="Selecione a classificação" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="L">Livre</SelectItem>
                <SelectItem value="10">10 anos</SelectItem>
                <SelectItem value="12">12 anos</SelectItem>
                <SelectItem value="14">14 anos</SelectItem>
                <SelectItem value="16">16 anos</SelectItem>
                <SelectItem value="18">18 anos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Categorias *</Label>

            {loadingCategories ? (
              <p className="text-sm text-muted">Carregando categorias...</p>
            ) : categoryError ? (
              <p role="alert" className="text-sm text-danger">
                {categoryError}
              </p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted">
                Nenhuma categoria disponível.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 rounded-md border p-3 sm:grid-cols-3">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      disabled={isSubmitting}
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            )}

            {categoryIds.length === 0 && (
              <p className="text-xs text-muted">
                Selecione pelo menos uma categoria.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="movie-thumbnail">
              Thumbnail {isEditing ? "(opcional)" : "*"}
            </Label>

            <FilePicker
              id="movie-thumbnail"
              icon={<Upload className="h-5 w-5 shrink-0" />}
              file={thumbnail}
              emptyLabel="Selecionar imagem da capa"
              accept="image/jpeg,image/png,image/webp"
              disabled={isSubmitting}
              resetKey={open ? "thumbnail-open" : "thumbnail-closed"}
              onFile={setThumbnail}
            />

            <p className="text-xs text-muted">
              JPEG, PNG ou WebP. Máximo de 5 MB.
              {isEditing && " Deixe vazio para manter a thumbnail atual."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="movie-video">
              Arquivo de vídeo {isEditing ? "(opcional)" : "*"}
            </Label>

            <FilePicker
              id="movie-video"
              icon={<Film className="h-5 w-5 shrink-0" />}
              file={video}
              emptyLabel="Selecionar vídeo MP4"
              accept="video/mp4,.mp4"
              disabled={isSubmitting}
              resetKey={open ? "video-open" : "video-closed"}
              onFile={setVideo}
            />

            <p className="text-xs text-muted">
              MP4. Máximo de 2 GB.
              {isEditing && " Deixe vazio para manter o vídeo atual."}
            </p>
          </div>

          {isSubmitting && uploadPhase !== "idle" && (
            <div className="space-y-2" aria-live="polite">
              <div className="flex items-center justify-between text-sm">
                <span>{uploadLabel}</span>
                {uploadPhase !== "saving" && <span>{uploadProgress}%</span>}
              </div>

              {uploadPhase !== "saving" && (
                <div
                  className="h-2 overflow-hidden rounded-full bg-border"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={uploadProgress}
                  aria-label={uploadLabel}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={
                isSubmitting ||
                loadingCategories ||
                Boolean(categoryError) ||
                categories.length === 0 ||
                categoryIds.length === 0
              }
            >
              {isSubmitting
                ? uploadPhase === "video" && uploadProgress >= 100
                  ? "Gravando..."
                  : uploadPhase === "saving"
                    ? "Salvando..."
                    : `Enviando... ${uploadProgress}%`
                : isEditing
                  ? "Salvar alterações"
                  : "Cadastrar filme"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function FilePicker({
  id,
  icon,
  file,
  emptyLabel,
  accept,
  disabled,
  resetKey,
  onFile,
}: {
  id: string;
  icon: React.ReactNode;
  file: File | null;
  emptyLabel: string;
  accept: string;
  disabled: boolean;
  resetKey: string;
  onFile: (file: File | null) => void;
}) {
  return (
    <>
      <label
        htmlFor={id}
        className={`flex items-center gap-3 rounded-lg border border-dashed border-border p-4 transition-colors ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:bg-elevated/70"
        }`}
      >
        {icon}
        <span className="min-w-0 break-all text-sm">
          {file ? `${file.name} · ${formatFileSize(file.size)}` : emptyLabel}
        </span>
      </label>

      <input
        key={resetKey}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => onFile(event.target.files?.[0] ?? null)}
      />
    </>
  );
}
