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

document.addEventListener("click", async (event) => {
  if (!(event.target instanceof HTMLButtonElement)) return;
  const item = event.target.closest("article");
  if (!(item instanceof HTMLElement)) return;
  await fetch("/approvals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: item.dataset.result,
  }).then(() => {
    item.remove();
  });
});

document.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement)) return;
  const value = event.target.value;
  document.querySelectorAll("img-comparison-slider").forEach((slider) => {
    if (!(slider instanceof HTMLElement)) return;
    const item = slider.closest("article");
    if (!(item instanceof HTMLElement) || !item.dataset.result) return;
    const result = JSON.parse(item.dataset.result);
    const secondImage = slider.querySelector('img[slot="second"]');
    if (!(secondImage instanceof HTMLImageElement)) return;
    secondImage.src = `/files/${result[`${value}File`]}`;
    const referenceInput = item.querySelector(
      `input[name="reference"][value="${value}"]`
    );
    if (!(referenceInput instanceof HTMLInputElement)) return;
    referenceInput.checked = true;
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "c" || event.key === "d") {
    const value = event.key === "c" ? "current" : "diff";
    const referenceInput = document.querySelector(
      `input[name="reference"][value="${value}"]`
    );
    if (!(referenceInput instanceof HTMLInputElement)) return;
    referenceInput.dispatchEvent(new Event("change", { bubbles: true }));
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
