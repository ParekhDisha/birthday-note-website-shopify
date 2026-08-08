// Dynamically sets card/parent aspect-ratios based on loaded image's natural dimensions
function getSafeRatio(width, height) {
  const raw = width / height;
  return Math.max(0.1, Math.min(10, raw)).toFixed(3);
}

function applyRatioToParent(img) {
  if (!img || !img.naturalWidth || !img.naturalHeight) return;
  const ratio = getSafeRatio(img.naturalWidth, img.naturalHeight);

  const parent = img.closest('.resource-image, .collection-card__image, .resource-card__media, .resource-card__image-wrapper');
  if (parent && parent.style) {
    parent.style.setProperty('--ratio', ratio);
    try { parent.style.aspectRatio = ratio; } catch (e) { /* ignore on older browsers */ }
  }

  // For grid thumbnails, apply ratio directly to the image to avoid distortion
  if (img.classList.contains('resource-card__collection-image') || img.classList.contains('resource-card__image')) {
    try { img.style.aspectRatio = ratio; } catch (e) {}
  }
}

function observeImage(img) {
  if (!img) return;
  if (img.complete && img.naturalWidth && img.naturalHeight) {
    applyRatioToParent(img);
    return;
  }

  img.addEventListener('load', function onload() {
    applyRatioToParent(img);
  }, { once: true });
}

function processExistingImages() {
  const sel = 'img.resource-image__image, img.resource-card__collection-image, img.resource-card__image';
  document.querySelectorAll(sel).forEach(observeImage);
}

// Observe DOM additions so dynamically-inserted cards are handled
const mo = new MutationObserver((mutations) => {
  for (const m of mutations) {
    for (const node of m.addedNodes) {
      if (!(node instanceof Element)) continue;
      if (node.matches && (node.matches('img.resource-image__image') || node.matches('img.resource-card__collection-image') || node.matches('img.resource-card__image'))) {
        observeImage(node);
        continue;
      }

      node.querySelectorAll && node.querySelectorAll('img.resource-image__image, img.resource-card__collection-image, img.resource-card__image').forEach(observeImage);
    }
  }
});

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processExistingImages);
  } else {
    processExistingImages();
  }

  mo.observe(document.body, { childList: true, subtree: true });
}

// exported for debugging/testing in the console
export { processExistingImages, applyRatioToParent };
