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
          const navList = document.querySelector("nav");

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
  if (event.target.tagName !== "BUTTON") return;
  await fetch("/approvals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: event.target.closest(".item").dataset.result,
  }).then(() => {
    event.target.closest(".item").remove();
  });
});
document.addEventListener("change", (event) => {
  if (event.target.type === "radio") {
    document.querySelectorAll("img-comparison-slider").forEach((slider) => {
      const result = JSON.parse(slider.closest(".item").dataset.result);
      slider.querySelector('img[slot="second"]').src =
        `/files/${result[`${event.target.value}File`]}`;
      slider
        .closest(".item")
        .querySelector(
          `input[name="reference"][value="${event.target.value}"]`
        ).checked = true;
    });
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "c" || event.key === "d") {
    const value = event.key === "c" ? "current" : "diff";
    document
      .querySelector(`input[name="reference"][value="${value}"]`)
      .dispatchEvent(new Event("change", { bubbles: true }));
  }
});
window.addEventListener("hashchange", onHashChange);
