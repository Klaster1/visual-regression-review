const onHashChange = () => {
  const platform = "tmp";
  document.querySelectorAll(".item").forEach((item) => {
    item.hidden = platform && item.dataset.platform !== platform;
  });
  document.querySelectorAll(".platforms-nav a").forEach((link) => {
    link.setAttribute(
      "aria-current",
      link.textContent === platform ? "page" : "false"
    );
  });
};
/**
 * @typedef {Object} Result
 * @property {string} fixture
 * @property {string} test
 * @property {string} name
 * @property {string} referenceFile
 * @property {string | null} failureFile
 * @property {string | null} currentFile
 * @property {Platform} platform
 */
await fetch("/results")
  .then((r) => r.json())
  .then(
    /** @param {Result[]} results */ (results) => {
      results
        .filter((result) => result.diffFile)
        .forEach((result) => {
          const item = document.getElementById("item").content.cloneNode(true);
          item.querySelector(".item").dataset.platform = result.platform;
          item.querySelector(".item").dataset.result = JSON.stringify(result);
          item.querySelector("dt.fixture").textContent = result.fixture;
          item.querySelector("dt.test").textContent = result.test;
          item.querySelector("dt.name").textContent = result.name;
          item.querySelector('img[slot="first"]').src =
            `/files/${result.referenceFile}`;
          item.querySelector('img[slot="second"]').src =
            `/files/${result.diffFile}`;
          item.querySelector('input[name="reference"][value="diff"]').checked =
            true;
          document.querySelector(".items").appendChild(item);
        });

      const platforms = [...new Set(results.map((result) => result.platform))];
      const platformItem = document.getElementById("platform-item");
      const platformsNav = document.querySelector(".platforms-nav");
      platforms.forEach((platform) => {
        const item = platformItem.content.cloneNode(true);
        item.querySelector("a").textContent = platform;
        item.querySelector("a").href = `#${platform}`;
        platformsNav.appendChild(item);
      });

      if (location.hash === "") {
        const firstPlatformWithDiffs = platforms.find((platform) =>
          results.some(
            (result) => result.platform === platform && result.diffFile
          )
        );
        if (firstPlatformWithDiffs) {
          location.hash = firstPlatformWithDiffs;
          onHashChange();
        }
      }
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
