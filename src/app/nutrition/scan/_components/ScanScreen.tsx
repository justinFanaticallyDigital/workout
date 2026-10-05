"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/kit";
import { SLOT_LABEL } from "@/lib/nutrition-view";
import { saveScan } from "../../_components/scan-store";

interface ScanScreenProps {
  mealId: string | null;
  mealName: string | null;
  role: string | null;
  back: string;
}

type CamStatus = "starting" | "live" | "denied" | "unsupported";

const MAX_EDGE = 1280;
const CORNERS = [
  "left-0 top-0 rounded-tl-[10px] border-l-[3px] border-t-[3px]",
  "right-0 top-0 rounded-tr-[10px] border-r-[3px] border-t-[3px]",
  "bottom-0 left-0 rounded-bl-[10px] border-b-[3px] border-l-[3px]",
  "bottom-0 right-0 rounded-br-[10px] border-b-[3px] border-r-[3px]",
];

/**
 * Full-screen camera over the dark cam tokens. Shutter captures a downscaled
 * JPEG, PHOTOS picks one from the library, MANUAL skips straight to the form.
 * The capture is handed to /nutrition/scan/review through sessionStorage.
 */
export default function ScanScreen({ mealId, mealName, role, back }: ScanScreenProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<CamStatus>("starting");
  const [torch, setTorch] = useState<boolean | null>(null); // null = no torch on this camera
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          v.play().catch(() => undefined);
        }
        const track = stream.getVideoTracks()[0];
        const caps = (track?.getCapabilities?.() ?? {}) as MediaTrackCapabilities & { torch?: boolean };
        setTorch(caps.torch ? false : null);
        setStatus("live");
      })
      .catch(() => {
        if (!cancelled) setStatus("denied");
      });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const go = useCallback(
    (image: string | null) => {
      saveScan({ image, mediaType: image ? "image/jpeg" : null, mealId, role, back });
      router.push("/nutrition/scan/review");
    },
    [mealId, role, back, router],
  );

  const capture = () => {
    const v = videoRef.current;
    if (!v || status !== "live" || busy || !v.videoWidth) return;
    setBusy(true);
    try {
      go(drawToJpeg(v, v.videoWidth, v.videoHeight));
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file || busy) return;
    setBusy(true);
    try {
      go(await fileToJpeg(file));
    } catch {
      setBusy(false);
    }
  };

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track || torch === null) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torch } as unknown as MediaTrackConstraintSet] });
      setTorch(!torch);
    } catch {
      /* torch not switchable while streaming on this device */
    }
  };

  const context = mealName ? `${mealName}${role ? ` · ${SLOT_LABEL[role] ?? role}` : ""}` : null;
  const hint = status === "live" ? "Fit the Nutrition Facts panel in the frame" : status === "starting" ? "Starting camera" : "Camera unavailable";

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[600px] flex-col bg-ft-cam-bg text-ft-cam-text">
      <div className="flex items-center px-5 pb-3 pt-[calc(env(safe-area-inset-top)+8px)]">
        <button type="button" onClick={() => router.push(back)} aria-label="Close" className="w-14 text-left text-[18px] leading-none">
          ✕
        </button>
        <div className="flex-1 text-center font-display text-[15px] uppercase tracking-[0.06em]">Scan label</div>
        <button type="button" onClick={toggleTorch} disabled={torch === null} className="w-14 text-right font-data text-[10.5px] tracking-[0.12em] text-ft-cam-muted disabled:opacity-40">
          {torch ? "FLASH ON" : "FLASH"}
        </button>
      </div>
      {context && (
        <div className="text-center">
          <span className="inline-block max-w-[85%] truncate rounded-full border border-ft-cam-text/30 px-3 py-1 font-data text-[10px] uppercase tracking-[0.14em]">Adding to · {context}</span>
        </div>
      )}

      <div className="relative mt-4 flex-1 overflow-hidden" style={{ background: "radial-gradient(ellipse at 50% 45%, #2A3833 0%, #141D1B 70%)" }}>
        <video ref={videoRef} playsInline muted autoPlay className={["absolute inset-0 h-full w-full object-cover transition-opacity", status === "live" ? "opacity-100" : "opacity-0"].join(" ")} />
        <div className="pointer-events-none absolute left-1/2 top-[46%] h-[380px] w-[260px] max-h-[70%] -translate-x-1/2 -translate-y-1/2">
          {CORNERS.map((c) => (
            <span key={c} className={`absolute h-8 w-8 border-ft-accent ${c}`} />
          ))}
          {status === "live" && <span className="scan-line absolute left-2 right-2 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgb(var(--ft-accent)), transparent)" }} />}
        </div>
        {(status === "denied" || status === "unsupported") && (
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 rounded-ft-lg border border-ft-cam-text/20 bg-ft-cam-bg/80 px-4 py-4 text-center">
            <div className="font-data text-[13px] font-bold">{status === "denied" ? "Camera permission needed" : "No camera here"}</div>
            <p className="mt-1 font-body text-[12.5px] text-ft-cam-muted">Pick a photo of the label or type the values in.</p>
            <div className="mt-3 flex gap-2">
              <Btn kind="ghost" small className="flex-1 !border-ft-cam-text/40 !text-ft-cam-text" onClick={() => fileRef.current?.click()}>
                Choose photo
              </Btn>
              <Btn small className="flex-1" onClick={() => go(null)}>
                Enter manually
              </Btn>
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ft-accent bg-ft-accent/[.22] px-3 py-[5px] font-data text-[10.5px] uppercase tracking-[0.14em]">
            <span className={["h-[7px] w-[7px] rounded-full", status === "live" ? "bg-ft-accent" : "bg-ft-cam-muted"].join(" ")} />
            {hint}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between px-9 pb-[calc(env(safe-area-inset-bottom)+26px)] pt-[22px]">
        <button type="button" onClick={() => go(null)} className="w-16 text-left font-data text-[10.5px] tracking-[0.14em] text-ft-cam-muted">
          MANUAL
        </button>
        <button type="button" onClick={capture} disabled={status !== "live" || busy} aria-label="Capture label" className="flex h-[74px] w-[74px] items-center justify-center rounded-full border-[3px] border-ft-cam-text disabled:opacity-40">
          <span className="h-[58px] w-[58px] rounded-full bg-ft-accent" />
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className="w-16 text-right font-data text-[10.5px] tracking-[0.14em] text-ft-cam-muted">
          PHOTOS
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
      </div>
    </div>
  );
}

/* ── image helpers ── */

function drawToJpeg(source: CanvasImageSource, width: number, height: number): string {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

async function fileToJpeg(file: File): Promise<string> {
  if (typeof createImageBitmap === "function") {
    const bmp = await createImageBitmap(file);
    try {
      return drawToJpeg(bmp, bmp.width, bmp.height);
    } finally {
      bmp.close();
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    return drawToJpeg(img, img.naturalWidth, img.naturalHeight);
  } finally {
    URL.revokeObjectURL(url);
  }
}
