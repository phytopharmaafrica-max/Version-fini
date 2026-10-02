import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  Leaf,
  CheckCircle,
  X,
  Video,
} from "lucide-react";

interface ProductMediaGalleryProps {
  productName: string;
  coverImage?: string | null;
  images?: string[] | null;
  videoUrl?: string | null;
  badge?: string | null;
}

export function ProductMediaGallery({
  productName,
  coverImage,
  images = [],
  videoUrl,
  badge,
}: ProductMediaGalleryProps) {
  // Aggregate all unique images: cover image first, then additional images
  const allImages: string[] = [];
  if (coverImage) allImages.push(coverImage);
  if (Array.isArray(images)) {
    images.forEach((img) => {
      if (img && !allImages.includes(img)) {
        allImages.push(img);
      }
    });
  }
  // Fallback if no image at all
  if (allImages.length === 0) {
    allImages.push("https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80");
  }

  // Media list: if videoUrl exists, we can present it as a special media item
  // Mode: "image" (showing image at selectedIndex) or "video" (showing video player)
  const hasVideo = Boolean(videoUrl && videoUrl.trim());
  const [activeType, setActiveType] = useState<"image" | "video">("image");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Synchroniser l'index si la photo principale ou la liste change
  useEffect(() => {
    setActiveImageIndex(0);
  }, [coverImage, allImages.length]);

  // Défilement automatique fluide des photos
  useEffect(() => {
    if (!autoRotate || activeType !== "image" || allImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % allImages.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [autoRotate, activeType, allImages.length]);

  // Helper to determine if videoUrl is a YouTube or Vimeo embed
  const isEmbedVideo = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com");
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v");
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return url;
  };

  const nextMedia = () => {
    if (activeType === "video") {
      setActiveType("image");
      setActiveImageIndex(0);
    } else {
      if (activeImageIndex < allImages.length - 1) {
        setActiveImageIndex((prev) => prev + 1);
      } else if (hasVideo) {
        setActiveType("video");
      } else {
        setActiveImageIndex(0);
      }
    }
  };

  const prevMedia = () => {
    if (activeType === "video") {
      setActiveType("image");
      setActiveImageIndex(allImages.length - 1);
    } else {
      if (activeImageIndex > 0) {
        setActiveImageIndex((prev) => prev - 1);
      } else if (hasVideo) {
        setActiveType("video");
      } else {
        setActiveImageIndex(allImages.length - 1);
      }
    }
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const totalMediaCount = allImages.length + (hasVideo ? 1 : 0);

  return (
    <div className="space-y-4 w-full">
      {/* CADRE PRINCIPAL D'AFFICHAGE (PHOTO OU VIDÉO) */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-900 border border-border/80 shadow-md group">
        {/* Badge produit éventuel (ex: "Best-seller", "Populaire") */}
        {badge && (
          <div className="absolute top-4 left-4 z-20">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800 text-white px-3 py-1 text-xs font-bold shadow-md">
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span>{badge}</span>
            </span>
          </div>
        )}

        {/* Compteur de médias (en haut à droite) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <span className="rounded-full bg-slate-950/70 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white shadow-xs">
            {activeType === "video" ? (
              <span className="flex items-center gap-1">
                <Play className="h-3 w-3 fill-amber-400 text-amber-400" /> Vidéo d'utilisation
              </span>
            ) : (
              `Photo ${activeImageIndex + 1} / ${allImages.length}`
            )}
          </span>

          {activeType === "image" && (
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="grid h-8 w-8 place-items-center rounded-full bg-slate-950/70 backdrop-blur-md text-white hover:bg-slate-900 transition"
              aria-label="Agrandir la photo"
              title="Agrandir en plein écran"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* CONTENU PRINCIPAL : VIDÉO OU IMAGE */}
        {activeType === "video" && videoUrl ? (
          <div className="relative h-full w-full bg-black flex items-center justify-center">
            {isEmbedVideo(videoUrl) ? (
              <iframe
                src={getEmbedUrl(videoUrl)}
                title={`Vidéo d'utilisation - ${productName}`}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="relative h-full w-full">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  playsInline
                  autoPlay
                  loop
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="h-full w-full object-cover"
                />
                {/* Contrôles superposés vidéo */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={toggleVideoPlay}
                    className="flex items-center gap-1.5 rounded-full bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-slate-900 transition"
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-white" />}
                    <span>{isPlaying ? "Pause" : "Lecture"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    className="grid h-8 w-8 place-items-center rounded-full bg-slate-950/80 backdrop-blur-md text-white hover:bg-slate-900 transition"
                    aria-label={isMuted ? "Activer le son" : "Couper le son"}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-full w-full overflow-hidden bg-mint/20 cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
            <img
              src={allImages[activeImageIndex]}
              alt={`${productName} — vue ${activeImageIndex + 1}`}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}

        {/* FLÈCHES DE NAVIGATION GAUCHE / DROITE */}
        {totalMediaCount > 1 && (
          <>
            <button
              type="button"
              onClick={prevMedia}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/90 dark:bg-slate-900/90 text-navy dark:text-white shadow-md transition hover:scale-110 active:scale-95 border border-border"
              aria-label="Média précédent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={nextMedia}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/90 dark:bg-slate-900/90 text-navy dark:text-white shadow-md transition hover:scale-110 active:scale-95 border border-border"
              aria-label="Média suivant"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* RANGÉE DE MINIATURES CLIQUABLES (PHOTOS + VIDÉO) */}
      {totalMediaCount > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
            <span>Galerie photos & Démonstration ({totalMediaCount} médias)</span>
            <span className="text-[11px] text-primary">Cliquez pour basculer</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
            {/* Vignette Vidéo (si présente) */}
            {hasVideo && (
              <button
                type="button"
                onClick={() => setActiveType("video")}
                className={`relative h-18 w-18 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                  activeType === "video"
                    ? "border-emerald-600 ring-2 ring-emerald-500/40 scale-105 shadow-md"
                    : "border-border hover:border-emerald-400 opacity-80 hover:opacity-100"
                }`}
                aria-label="Voir la vidéo d'utilisation"
              >
                <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center text-white">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-amber-400 text-slate-950">
                    <Play className="h-3.5 w-3.5 fill-slate-950 ml-0.5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 mt-1">
                    Vidéo
                  </span>
                </div>
              </button>
            )}

            {/* Vignettes Photos (jusqu'à 10) */}
            {allImages.map((imgUrl, idx) => {
              const isActive = activeType === "image" && activeImageIndex === idx;
              return (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  onClick={() => {
                    setActiveType("image");
                    setActiveImageIndex(idx);
                  }}
                  className={`relative h-18 w-18 shrink-0 overflow-hidden rounded-2xl border-2 bg-slate-100 dark:bg-slate-800 transition-all ${
                    isActive
                      ? "border-primary ring-2 ring-primary/40 scale-105 shadow-md"
                      : "border-border hover:border-primary/50 opacity-75 hover:opacity-100"
                  }`}
                  aria-label={`Photo ${idx + 1} de ${productName}`}
                >
                  <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 right-1 rounded-sm bg-slate-950/80 text-[8px] font-bold text-white text-center py-0.5">
                      Couverture
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ARGUMENTS DE CONFIANCE ET DE MOTIVATION D'ACHAT (SOUS LA GALERIE) */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/70 text-center">
        <div className="rounded-2xl border border-border bg-slate-50/70 dark:bg-slate-900/60 p-2.5 space-y-1">
          <Leaf className="h-4 w-4 text-emerald-600 mx-auto" />
          <p className="font-bold text-[11px] text-navy dark:text-slate-100">100% Plantes Bio</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Sans additif ni conservateur</p>
        </div>
        <div className="rounded-2xl border border-border bg-slate-50/70 dark:bg-slate-900/60 p-2.5 space-y-1">
          <ShieldCheck className="h-4 w-4 text-primary mx-auto" />
          <p className="font-bold text-[11px] text-navy dark:text-slate-100">Qualité Herboriste</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Formulé & dosé par experts</p>
        </div>
        <div className="rounded-2xl border border-border bg-slate-50/70 dark:bg-slate-900/60 p-2.5 space-y-1">
          <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto" />
          <p className="font-bold text-[11px] text-navy dark:text-slate-100">Garantie Efficacité</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Traçabilité & satisfaction</p>
        </div>
      </div>

      {/* DIALOGUE LIGHTBOX PLEIN ÉCRAN */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 transition"
            aria-label="Fermer la vue plein écran"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={allImages[activeImageIndex]}
              alt={productName}
              className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl"
            />
            <div className="mt-3 flex items-center justify-between text-xs text-white">
              <span>{productName}</span>
              <span>
                {activeImageIndex + 1} / {allImages.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
