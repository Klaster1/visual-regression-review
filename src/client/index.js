/**
 * @typedef {import('../types.ts').Result} Result
 */
await fetch("/results")
  .then((r) => r.json())
  .then(
    /** @param {Result[]} results */ (results) => {
      results
        .filter((result) => result.diffFile)
        .forEach((result) => {
          const itemTemplate = document.querySelector(
            "template#result-item-template"
          );
          const navItemTemplate = document.querySelector(
            "template#nav-item-template"
          );

          if (!(itemTemplate instanceof HTMLTemplateElement)) return;
          if (!(navItemTemplate instanceof HTMLTemplateElement)) return;

          const item = itemTemplate.content.cloneNode(true);
          const navItem = navItemTemplate.content.cloneNode(true);
          if (!item || !(item instanceof DocumentFragment)) return;
          if (!navItem || !(navItem instanceof DocumentFragment)) return;

          const article = item.querySelector("article");
          const heading = item.querySelector("h1");
          const imgFirst = item.querySelector('img[slot="first"]');
          const imgSecond = item.querySelector('img[slot="second"]');
          const inputDiff = item.querySelector(
            'input[name="reference"][value="diff"]'
          );
          const itemsContainer = document.querySelector(".items>ul");
          const navItemLink = navItem.querySelector("a");
          const navList = document.querySelector("nav>ol");

          if (!(article instanceof HTMLElement)) return;
          if (!(heading instanceof HTMLHeadingElement)) return;
          if (!(imgFirst instanceof HTMLImageElement)) return;
          if (!(imgSecond instanceof HTMLImageElement)) return;
          if (!(inputDiff instanceof HTMLInputElement)) return;
          if (!(itemsContainer instanceof HTMLElement)) return;
          if (!(navItemLink instanceof HTMLAnchorElement)) return;
          if (!(navList instanceof HTMLElement)) return;

          // Result
          article.dataset.result = JSON.stringify(result);
          heading.textContent = result.name;
          heading.id = result.name;
          imgFirst.src = `/files/${result.referenceFile}`;
          imgSecond.src = `/files/${result.diffFile}`;
          inputDiff.checked = true;
          itemsContainer.appendChild(item);

          // Nav
          navItemLink.textContent = result.name;
          navItemLink.href = `#${result.name}`;
          navList.appendChild(navItem);
        });
    }
  );
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
      currentLink.parentElement?.nextElementSibling?.querySelector("a");
    if (nextLink instanceof HTMLAnchorElement && nextLink.hash) {
      window.location.hash = nextLink.hash;
    }
  } else if (event.key === "k") {
    const currentHash = window.location.hash;
    const currentLink = document.querySelector(`nav a[href="${currentHash}"]`);
    if (!(currentLink instanceof HTMLAnchorElement)) return;
    const prevLink =
      currentLink.parentElement?.previousElementSibling?.querySelector("a");
    if (prevLink instanceof HTMLAnchorElement && prevLink.hash) {
      window.location.hash = prevLink.hash;
    }
  }
});
