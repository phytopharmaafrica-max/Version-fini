import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Video,
  Play,
  Trash2,
  Star,
  Plus,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Film,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ProductMediaManagerProps {
  coverImage: string;
  images: string[];
  videoUrl?: string;
  onCoverChange: (url: string) => void;
  onImagesChange: (newImages: string[]) => void;
  onVideoChange: (videoUrl: string) => void;
}

export function ProductMediaManager({
  coverImage,
  images = [],
  videoUrl = "",
  onCoverChange,
  onImagesChange,
  onVideoChange,
}: ProductMediaManagerProps) {
  const [compressing, setCompressing] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [videoInputUrl, setVideoInputUrl] = useState(videoUrl || "");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const maxPhotos = 10;
  const currentTotalPhotos = (coverImage ? 1 : 0) + images.length;

  // Process and compress image file to WebP data URL
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("Format non supporté"));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxDimension = 1200;
          let { width, height } = img;
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          canvas.width = width;
          canvas.height = height;
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/webp", 0.85);
            resolve(compressed);
          } else {
            reject(new Error("Canvas context failed"));
          }
        };
        img.onerror = () => reject(new Error("Image decode failed"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Read failed"));
      reader.readAsDataURL(file);
    });
  };

  // Handle multiple files upload at once
  const handleMultipleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setCompressing(true);
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      toast.error("Veuillez sélectionner des fichiers images valides (JPG, PNG, WebP).");
      setCompressing(false);
      return;
    }

    try {
      const addedDataUrls: string[] = [];
      for (const file of validFiles) {
        if (currentTotalPhotos + addedDataUrls.length >= maxPhotos) {
          toast.warning(`Limite de ${maxPhotos} photos atteinte.`);
          break;
        }
        const dataUrl = await processImageFile(file);
        addedDataUrls.push(dataUrl);
      }

      if (addedDataUrls.length > 0) {
        if (!coverImage) {
          // If no cover image exists, first uploaded image becomes cover
          const [first, ...rest] = addedDataUrls;
          onCoverChange(first);
          onImagesChange([...images, ...rest]);
        } else {
          onImagesChange([...images, ...addedDataUrls]);
        }
        toast.success(`${addedDataUrls.length} photo(s) ajoutée(s) et optimisée(s) !`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'importation de certaines photos.");
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Add image by URL
  const handleAddImageUrl = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    if (currentTotalPhotos >= maxPhotos) {
      toast.warning(`Vous avez atteint la limite de ${maxPhotos} photos.`);
      return;
    }

    if (!coverImage) {
      onCoverChange(trimmed);
    } else {
      onImagesChange([...images, trimmed]);
    }
    setNewImageUrl("");
    toast.success("Photo ajoutée à la galerie !");
  };

  // Set secondary photo as primary cover
  const handleMakeCover = (index: number) => {
    const targetImage = images[index];
    if (!targetImage) return;
    const oldCover = coverImage;
    const newImages = [...images];
    newImages.splice(index, 1);
    if (oldCover) {
      newImages.unshift(oldCover);
    }
    onCoverChange(targetImage);
    onImagesChange(newImages);
    toast.success("Photo définie comme image principale !");
  };

  // Remove secondary photo
  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onImagesChange(updated);
    toast.info("Photo retirée de la galerie.");
  };

  // Remove cover photo
  const handleRemoveCover = () => {
    if (images.length > 0) {
      const [nextCover, ...rest] = images;
      onCoverChange(nextCover);
      onImagesChange(rest);
    } else {
      onCoverChange("");
    }
    toast.info("Image principale retirée.");
  };

  // Handle video file upload (converts local video to data URL or object URL for preview)
  const handleVideoFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Veuillez sélectionner un fichier vidéo valide (MP4, WebM).");
      return;
    }
    // Limit to 30MB for browser responsiveness
    if (file.size > 35 * 1024 * 1024) {
      toast.error("Le fichier vidéo est trop lourd (> 35 Mo). Préférez un lien YouTube ou une courte vidéo compressée.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const videoDataUrl = event.target?.result as string;
      onVideoChange(videoDataUrl);
      setVideoInputUrl(videoDataUrl.slice(0, 40) + "… (Vidéo locale importée)");
      toast.success("Vidéo de démonstration importée avec succès !");
    };
    reader.readAsDataURL(file);
  };

  const handleApplyVideoUrl = () => {
    const trimmed = videoInputUrl.trim();
    onVideoChange(trimmed);
    if (trimmed) {
      toast.success("Lien vidéo enregistré !");
    } else {
      toast.info("Vidéo retirée.");
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-slate-50/60 dark:bg-slate-900/50 p-4 sm:p-5">
      {/* SECTION 1 : PHOTOS DU PRODUIT (JUSQU'À 10 PHOTOS) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <h4 className="font-bold text-xs sm:text-sm text-navy dark:text-slate-100">
              Photos du produit ({currentTotalPhotos} / {maxPhotos} photos)
            </h4>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Plusieurs angles (plante, texture, emballage, posologie)
          </span>
        </div>

        {/* Zone de glisser-déposer / sélection multiple */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleMultipleFiles(e.dataTransfer.files);
          }}
          className={`rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/60 bg-white dark:bg-slate-900"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleMultipleFiles(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-mint text-primary">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                Glissez vos photos ici ou{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary underline hover:text-primary/80"
                >
                  parcourez vos fichiers
                </button>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Sélectionnez jusqu'à 10 photos simultanément (JPG, PNG, WebP)
              </p>
            </div>
            {compressing && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary animate-pulse">
                Optimisation et compression des images en cours…
              </span>
            )}
          </div>
        </div>

        {/* Ajout manuel d'URL de photo */}
        <div className="flex gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Ou collez l'URL d'une photo (https://...)"
            className="flex-1 rounded-xl border border-border bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary text-foreground"
          />
          <button
            type="button"
            onClick={handleAddImageUrl}
            disabled={!newImageUrl.trim() || currentTotalPhotos >= maxPhotos}
            className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground hover:brightness-110 disabled:opacity-50 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </button>
        </div>

        {/* Grille des photos actuelles */}
        {currentTotalPhotos > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
            {/* Photo principale (Couverture) */}
            {coverImage && (
              <div className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-primary shadow-sm bg-mint/20">
                <img src={coverImage} alt="Couverture" className="h-full w-full object-cover" />
                <div className="absolute top-1.5 left-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-xs">
                    <Star className="h-2.5 w-2.5 fill-current" /> Principale
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-slate-950/80 text-white opacity-0 group-hover:opacity-100 transition hover:bg-destructive"
                  title="Supprimer la photo principale"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Photos secondaires de la galerie */}
            {images.map((imgUrl, idx) => (
              <div
                key={`${imgUrl}-${idx}`}
                className="relative group aspect-square rounded-2xl overflow-hidden border border-border bg-white dark:bg-slate-900 shadow-2xs hover:border-primary/60 transition"
              >
                <img src={imgUrl} alt={`Vue ${idx + 2}`} className="h-full w-full object-cover" />
                <div className="absolute top-1.5 left-1.5">
                  <span className="rounded-full bg-slate-950/70 text-white px-1.5 py-0.5 text-[9px] font-bold">
                    #{idx + 2}
                  </span>
                </div>

                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1.5 p-1">
                  <button
                    type="button"
                    onClick={() => handleMakeCover(idx)}
                    className="rounded-lg bg-primary text-primary-foreground px-2 py-1 text-[10px] font-bold shadow-xs hover:brightness-110 w-full text-center"
                    title="Mettre en photo principale"
                  >
                    Mettre en une
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="rounded-lg bg-destructive text-destructive-foreground px-2 py-1 text-[10px] font-bold shadow-xs hover:brightness-110 w-full text-center"
                    title="Supprimer cette photo"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-xs text-muted-foreground py-2">
            Aucune photo importée pour l'instant.
          </p>
        )}
      </div>

      {/* SECTION 2 : VIDÉO DE DÉMONSTRATION / UTILISATION DU PRODUIT */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-emerald-600" />
            <h4 className="font-bold text-xs sm:text-sm text-navy dark:text-slate-100">
              Vidéo de démonstration / utilisation (Fort impact commercial)
            </h4>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <Sparkles className="h-3 w-3" /> Boost conversion +80%
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Permet aux visiteurs de voir le mode d'infusion, la texture des feuilles, l'application d'un baume ou l'utilisation du compte-gouttes.
        </p>

        {/* Input URL Vidéo + Bouton d'upload local */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={videoInputUrl}
              onChange={(e) => setVideoInputUrl(e.target.value)}
              placeholder="Lien vidéo YouTube, Vimeo ou URL directe MP4..."
              className="flex-1 rounded-xl border border-border bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-primary text-foreground font-mono"
            />
            <button
              type="button"
              onClick={handleApplyVideoUrl}
              className="rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground hover:brightness-110 shrink-0"
            >
              Enregistrer
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm"
              className="hidden"
              onChange={handleVideoFile}
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <UploadCloud className="h-3.5 w-3.5 text-primary" />
              <span>Importer un fichier vidéo MP4/WebM depuis votre appareil</span>
            </button>

            {videoUrl && (
              <button
                type="button"
                onClick={() => {
                  onVideoChange("");
                  setVideoInputUrl("");
                  toast.info("Vidéo supprimée.");
                }}
                className="inline-flex items-center gap-1 text-xs text-destructive hover:underline ml-auto"
              >
                <Trash2 className="h-3 w-3" /> Supprimer la vidéo
              </button>
            )}
          </div>
        </div>

        {/* Aperçu direct du lecteur vidéo si vidéo présente */}
        {videoUrl && (
          <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-black/95 p-2 overflow-hidden space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-white text-[11px] px-2 py-1">
              <span className="flex items-center gap-1.5 font-bold text-amber-300">
                <Play className="h-3 w-3 fill-amber-300" /> Aperçu du lecteur vidéo
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
                {videoUrl.slice(0, 35)}…
              </span>
            </div>

            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
              {videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") || videoUrl.includes("vimeo.com") ? (
                <iframe
                  src={
                    videoUrl.includes("youtube.com/watch")
                      ? `https://www.youtube-nocookie.com/embed/${new URL(videoUrl).searchParams.get("v")}`
                      : videoUrl.includes("youtu.be/")
                      ? `https://www.youtube-nocookie.com/embed/${videoUrl.split("youtu.be/")[1]?.split("?")[0]}`
                      : videoUrl
                  }
                  title="Aperçu vidéo"
                  className="h-full w-full border-0"
                  allowFullScreen
                />
              ) : (
                <video src={videoUrl} controls playsInline className="h-full w-full object-contain" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
