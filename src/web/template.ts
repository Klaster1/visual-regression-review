import html from "html-template-tag";
import type { Result } from "../types.ts";

export const template = (results: Result[]) =>
  html`<html>
    <head>
      <title>Visual Regression Review</title>
      <script
        defer
        src="https://cdn.jsdelivr.net/npm/img-comparison-slider@8/dist/index.js"
      ></script>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/img-comparison-slider@8/dist/styles.css"
      />
      <link
        rel="icon"
        href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👁️</text></svg>"
      />
      <link rel="stylesheet" href="style.css" />
      <script type="module" src="script.js"></script>
    </head>
    <body>
      <main>
        <aside>
          <div class="content">
            <form>
              <fieldset>
                <legend>Compare against</legend>
                <label>
                  <input type="radio" name="reference" value="diff" checked />
                  Diff
                </label>
                <label>
                  <input type="radio" name="reference" value="current" />
                  Current
                </label>
              </fieldset>
            </form>
            <nav>
              <ol>
                ${results.map(
                  (result) =>
                    html`<li>
                      <a href="#${result.name}">${result.name}</a>
                    </li>`
                )}
              </ol>
            </nav>
          </div>
        </aside>
        <section class="items">
          <ul>
            ${results.map(
              (result) =>
                html`<li>
                  <article>
                    <header>
                      <h1 id="${result.name}">${result.name}</h1>
                      <form method="post" action="/approvals/${result.name}">
                        <button type="submit">Approve</button>
                      </form>
                    </header>
                    <img-comparison-slider>
                      <img slot="first" src="/files/${result.referenceFile}" />
                      <img
                        slot="second"
                        src="/files/${result.diffFile}"
                        data-mode="diff"
                      />
                      <img
                        slot="second"
                        src="/files/${result.currentFile}"
                        data-mode="current"
                        hidden
                      />
                    </img-comparison-slider>
                  </article>
                </li>`
            )}
          </ul>
          <span class="done">No regressions! 🎉</span>
        </section>
      </main>
    </body>
  </html>`;
