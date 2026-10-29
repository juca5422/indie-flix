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
import { createMovie } from "@/lib/actions/movies";
import { uploadMedia } from "@/lib/media/media";

type CategoryOption = {
  id: string;
  name: string;
};

export function AddMovieDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [ageRating, setAgeRating] = useState("L");

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

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

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setTitle("");
      setSynopsis("");
      setAgeRating("L");
      setCategoryIds([]);
      setVideo(null);
      setThumbnail(null);
      setCategoryError("");
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

    if (!video || !thumbnail) {
      alert("Selecione o vídeo e a thumbnail.");
      return;
    }

    if (categoryIds.length === 0) {
      alert("Selecione pelo menos uma categoria.");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedVideo = await uploadMedia(video, "videos");

      const uploadedThumbnail = await uploadMedia(thumbnail, "thumbnails");

      const result = await createMovie({
        title,
        synopsis,
        ageRating,
        categoryIds,
        videoUrl: uploadedVideo.key,
        thumbnailUrl: uploadedThumbnail.key,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      alert(result.message);
      handleOpenChange(false);
    } catch (error) {
      console.error("Erro ao cadastrar filme:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o filme.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar vídeo
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar filme</DialogTitle>
          <DialogDescription>
            Preencha os dados do filme e selecione os arquivos que serão
            enviados para análise.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="movie-title">Título</Label>
            <Input
              id="movie-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Nome do filme"
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="movie-synopsis">Sinopse</Label>
            <Textarea
              id="movie-synopsis"
              value={synopsis}
              onChange={(event) => setSynopsis(event.target.value)}
              placeholder="Conte um pouco sobre o filme..."
              maxLength={5000}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age-rating">Classificação indicativa</Label>

            <Select value={ageRating} onValueChange={setAgeRating}>
              <SelectTrigger id="age-rating" className="w-full">
                <SelectValue placeholder="Selecione a classificação" />
              </SelectTrigger>

              <SelectContent position="popper" className="z-[100]">
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
            <Label>Categorias</Label>

            <div className="rounded-md border border-border bg-surface p-3">
              {loadingCategories ? (
                <p className="text-sm text-muted-foreground">
                  Carregando categorias...
                </p>
              ) : categoryError ? (
                <p className="text-sm text-destructive">{categoryError}</p>
              ) : categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma categoria cadastrada.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm transition-colors hover:bg-elevated"
                    >
                      <input
                        type="checkbox"
                        checked={categoryIds.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="size-4 shrink-0 accent-primary"
                      />

                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Selecione uma ou mais categorias. Selecionadas:{" "}
              {categoryIds.length}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="movie-thumbnail">Thumbnail (capa)</Label>

            <label
              htmlFor="movie-thumbnail"
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border p-4 transition-colors hover:bg-muted/50"
            >
              <Upload className="h-5 w-5 shrink-0" />
              <span className="min-w-0 break-all text-sm">
                {thumbnail ? thumbnail.name : "Selecionar imagem da capa"}
              </span>
            </label>

            <Input
              key={open ? "thumbnail-open" : "thumbnail-closed"}
              id="movie-thumbnail"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) =>
                setThumbnail(event.target.files?.[0] ?? null)
              }
              required
            />

            <p className="text-xs text-muted-foreground">
              Formatos aceitos: JPEG, PNG ou WebP. Máximo de 5 MB.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="movie-video">Arquivo de vídeo</Label>

            <label
              htmlFor="movie-video"
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border p-4 transition-colors hover:bg-muted/50"
            >
              <Film className="h-5 w-5 shrink-0" />
              <span className="min-w-0 break-all text-sm">
                {video ? video.name : "Selecionar vídeo MP4"}
              </span>
            </label>

            <Input
              key={open ? "video-open" : "video-closed"}
              id="movie-video"
              type="file"
              accept="video/mp4,.mp4"
              className="sr-only"
              onChange={(event) => setVideo(event.target.files?.[0] ?? null)}
              required
            />

            <p className="text-xs text-muted-foreground">
              Formato aceito: MP4. Máximo de 2 GB.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando arquivos..." : "Cadastrar filme"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
