const handleHashChange = () => {
  const oldCurrent = document.querySelector("a.active");
  if (oldCurrent instanceof HTMLAnchorElement) {
    oldCurrent.classList.remove("active");
  }

  const currentHash = window.location.hash;
  const anchor = document.querySelector(`a[href="${currentHash}"]`);
  if (!(anchor instanceof HTMLAnchorElement)) return;
  anchor.classList.add("active");
};

window.addEventListener("hashchange", handleHashChange);

/**
 * @param {import('../types.ts').DiffMode} mode
 */
const toggleDiffMode = (mode) => {
  const diffRadios = document.querySelectorAll(
    'input[name="reference"][value="diff"]'
  );
  const currentRadios = document.querySelectorAll(
    'input[name="reference"][value="current"]'
  );
  const diffImages = document.querySelectorAll(
    'img[slot="second"][data-mode="diff"]'
  );
  const currentImages = document.querySelectorAll(
    'img[slot="second"][data-mode="current"]'
  );
  diffRadios.forEach((radio) => {
    if (!(radio instanceof HTMLInputElement)) return;
    radio.checked = mode === "diff";
  });
  currentRadios.forEach((radio) => {
    if (!(radio instanceof HTMLInputElement)) return;
    radio.checked = mode === "current";
  });
  diffImages.forEach((image) => {
    if (!(image instanceof HTMLImageElement)) return;
    image.hidden = mode !== "diff";
  });
  currentImages.forEach((image) => {
    if (!(image instanceof HTMLImageElement)) return;
    image.hidden = mode !== "current";
  });
};

document.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement)) return;
  const value = event.target.value;
  if (value !== "current" && value !== "diff") return;
  toggleDiffMode(value);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "c" || event.key === "d") {
    const value = event.key === "c" ? "current" : "diff";
    toggleDiffMode(value);
  } else if (event.key === "j") {
    const currentHash = window.location.hash;
    const currentLink = document.querySelector(`nav a[href="${currentHash}"]`);
    if (!(currentLink instanceof HTMLAnchorElement)) return;
    const nextLink =
      currentLink.parentElement?.nextElementSibling?.querySelector("a") ??
      document.querySelector("nav ol li:first-child a");
    if (nextLink instanceof HTMLAnchorElement && nextLink.hash) {
      window.location.hash = nextLink.hash;
    }
  } else if (event.key === "k") {
    const currentHash = window.location.hash;
    const currentLink = document.querySelector(`nav a[href="${currentHash}"]`);
    if (!(currentLink instanceof HTMLAnchorElement)) return;
    const prevLink =
      currentLink.parentElement?.previousElementSibling?.querySelector("a") ??
      document.querySelector("nav ol li:last-child a");
    if (prevLink instanceof HTMLAnchorElement && prevLink.hash) {
      window.location.hash = prevLink.hash;
    }
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        history.replaceState(null, "", `#${entry.target.id}`);
        handleHashChange();
      }
    });
  },
  { threshold: [0.1] }
);

document.querySelectorAll("h1").forEach((heading) => {
  observer.observe(heading);
});
