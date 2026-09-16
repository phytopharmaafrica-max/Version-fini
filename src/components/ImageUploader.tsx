import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { UploadCloud, Image as ImageIcon, CheckCircle2, Sparkles, X, RefreshCw, HardDrive, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  value: string;
  onChange: (dataUrl: string, fileName?: string) => void;
  onAutoDescribe?: (fileName: string, base64: string) => void;
  isDescribing?: boolean;
  label?: string;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  onAutoDescribe,
  isDescribing = false,
  label = "Photo du produit (PC, Carte SD, Smartphone)",
  className = "",
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [fileSizeStr, setFileSizeStr] = useState<string>("");
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState(value || "");

  // Compresses and resizes image in-browser to WebP/JPEG data URL for ultra-fast storage
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).");
      return;
    }

    setCompressing(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Target maximum dimension 1200px for crystal-clear retina display while keeping payload < 180kb
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
          // Export with WebP or high quality JPEG
          const compressedDataUrl = canvas.toDataURL("image/webp", 0.85);
          const sizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
          setFileSizeStr(`${sizeKb} Ko • ${width}×${height}px`);
          onChange(compressedDataUrl, file.name);
          toast.success(`Image "${file.name}" importée et optimisée avec succès (${sizeKb} Ko) !`);
          setCompressing(false);
        }
      };
      img.onerror = () => {
        toast.error("Erreur de décodage de l'image.");
        setCompressing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    onChange("");
    setFileName("");
    setFileSizeStr("");
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-foreground/80">{label}</label>
        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
              mode === "upload" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Fichier local (PC / Mobile)
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
              mode === "url" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Lien Web (URL)
          </button>
        </div>
      </div>

      {mode === "url" ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:text-destructive"
            >
              Effacer
            </button>
          )}
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {!value ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:border-primary/60 hover:bg-muted/40"
              }`}
            >
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                {compressing ? (
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <UploadCloud className="h-6 w-6" />
                )}
              </div>

              <div className="text-xs font-semibold text-foreground">
                Glissez-déposez votre image ici, ou{" "}
                <span className="text-primary underline">parcourez vos fichiers</span>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <HardDrive className="h-3 w-3" /> Disque dur / Clé USB / Carte SD
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Smartphone className="h-3 w-3" /> Galerie Smartphone / Appareil photo
                </span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Optimisation WebP automatique haute résolution & zéro coût de stockage
              </p>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-background p-3">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <img src={value} alt="Aperçu" className="h-full w-full object-cover" />
                  <div className="absolute top-1 right-1 rounded-full bg-primary p-0.5 text-primary-foreground shadow-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1 text-left">
                  <div className="truncate text-xs font-semibold text-foreground">
                    {fileName || "Image sélectionnée"}
                  </div>
                  {fileSizeStr && (
                    <div className="text-[11px] font-mono text-muted-foreground">
                      {fileSizeStr}
                    </div>
                  )}
                  <p className="text-[11px] text-emerald-600 font-medium">
                    Prêt pour le catalogue & affichage instantané
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent"
                    >
                      <RefreshCw className="h-3 w-3" /> Remplacer l'image
                    </button>
                    {onAutoDescribe && (
                      <button
                        type="button"
                        disabled={isDescribing}
                        onClick={() => onAutoDescribe(fileName, value)}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Sparkles className={`h-3 w-3 ${isDescribing ? "animate-spin" : ""}`} />
                        {isDescribing ? "Génération en cours..." : "Auto-décrire ce produit ✨"}
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClear}
                  className="self-start rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Supprimer l'image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
