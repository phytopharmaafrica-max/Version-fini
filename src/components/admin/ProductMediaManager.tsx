import { useState, useRef, type ChangeEvent } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Star,
  Plus,
  Film,
  Sparkles,
  RefreshCw,
  X,
  Camera,
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
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceCoverFileRef = useRef<HTMLInputElement>(null);
  const replaceSingleFileRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const maxPhotos = 10;
  const currentTotalPhotos = (coverImage ? 1 : 0) + images.length;

  // Compression automatique en WebP optimisé pour mobile et chargement ultra-rapide
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
        img.onerror = () => reject(new Error("Erreur de décodage de l'image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
      reader.readAsDataURL(file);
    });
  };

  // Téléchargement multiple de photos depuis le portable ou l'ordinateur
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
          // Si aucune image vedette n'existe, la première devient la photo vedette
          const [first, ...rest] = addedDataUrls;
          onCoverChange(first);
          onImagesChange([...images, ...rest]);
        } else {
          onImagesChange([...images, ...addedDataUrls]);
        }
        toast.success(`${addedDataUrls.length} photo(s) importée(s) et ajoutée(s) au produit !`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'importation de certaines photos.");
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remplacer directement la photo principale / vedette
  const handleReplaceCoverFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const dataUrl = await processImageFile(file);
      onCoverChange(dataUrl);
      toast.success("Photo principale / vedette changée avec succès !");
    } catch (err) {
      toast.error("Erreur lors du changement de la photo principale.");
    } finally {
      setCompressing(false);
      if (replaceCoverFileRef.current) replaceCoverFileRef.current.value = "";
    }
  };

  // Remplacer une photo spécifique dans la galerie
  const handleReplaceSingleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingIndex === null) return;
    setCompressing(true);
    try {
      const dataUrl = await processImageFile(file);
      const copy = [...images];
      copy[replacingIndex] = dataUrl;
      onImagesChange(copy);
      toast.success(`Photo #${replacingIndex + 2} remplacée avec succès !`);
    } catch (err) {
      toast.error("Erreur lors du remplacement de la photo.");
    } finally {
      setCompressing(false);
      setReplacingIndex(null);
      if (replaceSingleFileRef.current) replaceSingleFileRef.current.value = "";
    }
  };

  // Ajouter une photo via son URL web
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

  // Définir une photo secondaire comme photo principale / vedette
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
    toast.success("Cette photo est désormais la photo vedette principale !");
  };

  // Supprimer une photo secondaire
  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onImagesChange(updated);
    toast.info("Photo retirée de la galerie.");
  };

  // Supprimer la photo principale (promouvoir la suivante si existante)
  const handleRemoveCover = () => {
    if (images.length > 0) {
      const [nextCover, ...rest] = images;
      onCoverChange(nextCover);
      onImagesChange(rest);
    } else {
      onCoverChange("");
    }
    toast.info("Photo principale supprimée.");
  };

  // Vider complètement toutes les photos pour repartir de zéro
  const handleClearAllPhotos = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vider toutes les photos de ce produit ?")) {
      onCoverChange("");
      onImagesChange([]);
      toast.info("Toutes les photos ont été retirées. Vous pouvez en importer de nouvelles.");
    }
  };

  // Gestion de la vidéo locale
  const handleVideoFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Veuillez sélectionner un fichier vidéo valide (MP4, WebM).");
      return;
    }
    if (file.size > 35 * 1024 * 1024) {
      toast.error("Le fichier vidéo est trop lourd (> 35 Mo). Préférez un lien YouTube ou une vidéo compressée.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const videoDataUrl = event.target?.result as string;
      onVideoChange(videoDataUrl);
      setVideoInputUrl(videoDataUrl.slice(0, 40) + "… (Vidéo importée)");
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
    <div className="space-y-6 rounded-3xl border border-border bg-slate-50/80 dark:bg-slate-900/60 p-4 sm:p-6 shadow-xs">
      {/* Inputs cachés pour le remplacement rapide de photos */}
      <input
        ref={replaceCoverFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceCoverFile}
      />
      <input
        ref={replaceSingleFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceSingleFile}
      />

      {/* EN-TÊTE : PHOTOS DU PRODUIT */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-navy dark:text-slate-100 flex items-center gap-2">
                <span>Photos du produit ({currentTotalPhotos} / {maxPhotos} photos)</span>
                {currentTotalPhotos > 1 && (
                  <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                    Animation tournante active
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Toutes les photos sont modifiables, remplaçables et défilent automatiquement en boutique.
              </p>
            </div>
          </div>

          {currentTotalPhotos > 0 && (
            <button
              type="button"
              onClick={handleClearAllPhotos}
              className="text-[11px] font-semibold text-destructive hover:underline self-start sm:self-auto flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" /> Vider toutes les photos
            </button>
          )}
        </div>

        {/* SECTION PHOTO PRINCIPALE / VEDETTE */}
        {coverImage ? (
          <div className="rounded-2xl border-2 border-primary/40 bg-white dark:bg-slate-900 p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-xs">
                <Star className="h-3 w-3 fill-current" /> Photo Principale (Vedette de la boutique)
              </span>
              <span className="text-[11px] text-muted-foreground">
                C'est cette photo qui s'affiche en couverture
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative h-32 w-32 shrink-0 rounded-2xl overflow-hidden border border-border bg-mint/20 shadow-xs">
                <img
                  src={coverImage}
                  alt="Photo principale"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <p className="text-xs font-semibold text-foreground">
                  Vous pouvez remplacer cette photo principale à tout moment ou en choisir une autre :
                </p>
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => replaceCoverFileRef.current?.click()}
                    disabled={compressing}
                    className="btn-hero inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Remplacer depuis le portable / PC
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="inline-flex items-center gap-1 rounded-xl border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer cette photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-center space-y-2">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
              ⚠️ Aucune photo principale sélectionnée pour l'instant.
            </p>
            <button
              type="button"
              onClick={() => replaceCoverFileRef.current?.click()}
              className="btn-hero inline-flex items-center gap-2 px-4 py-2 text-xs font-bold"
            >
              <UploadCloud className="h-4 w-4" /> Choisir la photo principale
            </button>
          </div>
        )}

        {/* ZONE DE GLISSER-DÉPOSER / TÉLÉCHARGEMENT MULTIPLE */}
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
          className={`rounded-2xl border-2 border-dashed p-4 sm:p-5 text-center transition-all ${
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
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xs">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary underline hover:text-primary/80 font-extrabold"
                >
                  Télécharger des photos depuis votre portable ou PC
                </button>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Sélectionnez jusqu'à 10 photos simultanément (JPG, PNG, WebP)
              </p>
            </div>
            {compressing && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary animate-pulse">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Traitement et optimisation WebP en cours…
              </span>
            )}
          </div>
        </div>

        {/* AJOUT D'UNE PHOTO VIA URL WEB */}
        <div className="flex gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Ou collez l'URL directe d'une photo (https://...)"
            className="flex-1 rounded-xl border border-border bg-white dark:bg-slate-900 px-3.5 py-2 text-xs outline-none focus:border-primary text-foreground font-mono"
          />
          <button
            type="button"
            onClick={handleAddImageUrl}
            disabled={!newImageUrl.trim() || currentTotalPhotos >= maxPhotos}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-bold text-primary-foreground hover:brightness-110 disabled:opacity-50 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </button>
        </div>

        {/* GALERIE DES PHOTOS SECONDAIRES AVEC CONTRÔLES TOUJOURS VISIBLES */}
        {images.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>Photos supplémentaires de la galerie ({images.length}) :</span>
              <span className="text-[11px] font-normal italic">
                Ces photos tournent automatiquement en boucle sur la carte produit et la fiche
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((imgUrl, idx) => (
                <div
                  key={`${imgUrl}-${idx}`}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-white dark:bg-slate-900 p-2 shadow-xs hover:border-primary/60 transition space-y-2"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-mint/10">
                    <img
                      src={imgUrl}
                      alt={`Photo ${idx + 2}`}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute top-1 left-1 rounded-full bg-black/70 text-white px-1.5 py-0.5 text-[9px] font-bold">
                      Vue #{idx + 2}
                    </span>
                  </div>

                  {/* Actions toujours accessibles (y compris sur mobile/tactile) */}
                  <div className="space-y-1 pt-1">
                    <button
                      type="button"
                      onClick={() => handleMakeCover(idx)}
                      className="w-full rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground py-1 text-[11px] font-bold transition flex items-center justify-center gap-1"
                      title="Mettre en photo principale de couverture"
                    >
                      <Star className="h-3 w-3 fill-current" /> Mettre en vedette
                    </button>

                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setReplacingIndex(idx);
                          replaceSingleFileRef.current?.click();
                        }}
                        className="rounded-lg border border-border bg-background py-1 text-[10px] font-semibold text-foreground hover:border-primary transition flex items-center justify-center gap-1"
                        title="Remplacer cette photo"
                      >
                        <RefreshCw className="h-2.5 w-2.5" /> Remplacer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 py-1 text-[10px] font-semibold transition flex items-center justify-center gap-1"
                        title="Supprimer cette photo"
                      >
                        <Trash2 className="h-2.5 w-2.5" /> Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION VIDÉO DE DÉMONSTRATION DU PRODUIT */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-600/10 text-emerald-600">
              <Film className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-navy dark:text-slate-100">
              Vidéo de démonstration ou d'utilisation (Optionnel)
            </h4>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <Sparkles className="h-3 w-3" /> Impact visuel captivant
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Permet de montrer la préparation de la plante, l'infusion, la texture ou les bienfaits réels aux acheteurs.
        </p>

        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={videoInputUrl}
              onChange={(e) => setVideoInputUrl(e.target.value)}
              placeholder="Lien YouTube ou URL directe vidéo (https://...)"
              className="flex-1 rounded-xl border border-border bg-white dark:bg-slate-900 px-3.5 py-2 text-xs outline-none focus:border-primary text-foreground font-mono"
            />
            <button
              type="button"
              onClick={handleApplyVideoUrl}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 shrink-0"
            >
              Enregistrer
            </button>
          </div>

          <div className="flex items-center gap-2">
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary transition"
            >
              <Film className="h-3.5 w-3.5 text-emerald-600" /> Importer un court extrait vidéo (MP4 / WebM)
            </button>
            {videoUrl && (
              <button
                type="button"
                onClick={() => {
                  onVideoChange("");
                  setVideoInputUrl("");
                  toast.info("Vidéo supprimée.");
                }}
                className="text-xs text-destructive hover:underline"
              >
                Supprimer la vidéo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
