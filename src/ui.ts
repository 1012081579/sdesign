const HOVER_COLOR_TOKENS = [
  "--yellow",
  "--green",
  "--pink",
  "--orange",
  "--gold",
  "--lavender",
  "--cyan",
  "--lime",
] as const;

const DEFAULT_HOVER_TARGETS = [
  "a:not(.profile-contact-card)",
  "button:not(.avatar):not(.profile-sticker-toggle)",
  ".token",
  ".mini-token",
  ".course-card",
  ".category-list li",
] as const;

const SELECTION_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);

let randomSelectionColorReady = false;

export const readHoverColors = (): string[] => {
  const styles = getComputedStyle(document.documentElement);

  return HOVER_COLOR_TOKENS
    .map((name) => styles.getPropertyValue(name).trim())
    .filter(Boolean);
};

export const getRandomPaletteColor = (colors: readonly string[]): string => (
  colors.length ? colors[Math.floor(Math.random() * colors.length)] : "#85847f"
);

const assignRandomSelectionColor = (): void => {
  const colors = readHoverColors();

  if (!colors.length) {
    return;
  }

  document.documentElement.style.setProperty("--selection-ink", getRandomPaletteColor(colors));
};

export const setupRandomSelectionColor = (): void => {
  assignRandomSelectionColor();

  if (randomSelectionColorReady) {
    return;
  }

  randomSelectionColorReady = true;
  document.addEventListener("selectstart", assignRandomSelectionColor);
  document.addEventListener("keydown", (event) => {
    if (event.shiftKey && SELECTION_KEYS.has(event.key)) {
      assignRandomSelectionColor();
    }
  });
};

const assignRandomHoverColor = (element: HTMLElement, colors: readonly string[]): void => {
  if (colors.length) {
    element.style.setProperty("--hover-fill", getRandomPaletteColor(colors));
  }
};

export const applyRandomHover = (
  scope: ParentNode = document,
  targets: readonly string[] = DEFAULT_HOVER_TARGETS,
): void => {
  const colors = readHoverColors();

  scope.querySelectorAll<HTMLElement>(targets.join(",")).forEach((element) => {
    if (element.dataset.randomHoverReady === "true") {
      return;
    }

    element.dataset.randomHoverReady = "true";
    element.classList.add("random-hover");
    element.addEventListener("mouseenter", () => assignRandomHoverColor(element, colors));
    element.addEventListener("focus", () => assignRandomHoverColor(element, colors));
  });
};
