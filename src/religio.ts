import { applyRandomHover, setupRandomSelectionColor } from "./ui";

const DETAIL_HOVER_TARGETS = [
  "a:not(.profile-contact-card)",
  "button",
  ".religio-chip",
  ".religio-panel",
  ".religio-step",
] as const;

const clamp = (value: number, min: number, max: number): number => (
  Math.min(max, Math.max(min, value))
);

const setupScrollProgress = (): void => {
  scrollProgressController?.abort();
  scrollProgressController = new AbortController();

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;

    document.documentElement.style.setProperty(
      "--detail-progress",
      `${clamp(progress, 0, 1) * 100}%`,
    );
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, {
    passive: true,
    signal: scrollProgressController.signal,
  });
  window.addEventListener("resize", updateProgress, {
    signal: scrollProgressController.signal,
  });
};

const setupHeroTilt = (): void => {
  const frame = document.querySelector<HTMLElement>(".religio-image-frame");

  if (!frame) {
    return;
  }

  frame.addEventListener("pointermove", (event) => {
    const rect = frame.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    frame.classList.add("is-tilting");
    frame.style.setProperty("--tilt-x", `${clamp(x * 8, -4, 4)}deg`);
    frame.style.setProperty("--tilt-y", `${clamp(y * -8, -4, 4)}deg`);
  });

  frame.addEventListener("pointerleave", () => {
    frame.classList.remove("is-tilting");
    frame.style.removeProperty("--tilt-x");
    frame.style.removeProperty("--tilt-y");
  });
};

const setupReveal = (): void => {
  const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18 });

  revealItems.forEach((item) => observer.observe(item));
};

const setupAutoplayVideos = (): void => {
  document.querySelectorAll<HTMLVideoElement>("video[autoplay]").forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;

    const playVideo = () => {
      void video.play().catch(() => undefined);
    };

    playVideo();
    window.addEventListener("load", playVideo, { once: true });

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playVideo();
        }
      });
    }, { rootMargin: "240px" });

    observer.observe(video);
  });
};

let scrollProgressController: AbortController | undefined;

export const initReligioPage = (): void => {
  setupRandomSelectionColor();
  applyRandomHover(document, DETAIL_HOVER_TARGETS);
  setupScrollProgress();
  setupHeroTilt();
  setupReveal();
  setupAutoplayVideos();
};
