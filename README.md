# L. Manikanta | Portfolio

Static portfolio site (HTML, CSS, JavaScript). No build step, no dependencies.

```
manikanta-portfolio/
├── index.html
├── css/style.css
├── js/main.js
├── favicon.svg
├── .nojekyll
└── README.md
```

## Deploy on GitHub Pages

1. Create a new public repository on GitHub. For a clean URL, name it `<your-github-username>.github.io`.
2. Upload everything in this folder to the repository root (so `index.html` is at the top level).
   ```bash
   git init
   git add .
   git commit -m "Add portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-github-username>/<repo-name>.git
   git push -u origin main
   ```
3. On GitHub: **Settings > Pages > Build and deployment**. Set Source to **Deploy from a branch**, Branch to **main**, folder **/(root)**, then Save.
4. After a minute your site is live at `https://<your-github-username>.github.io/`.

## Other hosts

Vercel and Netlify both work: import the repository, leave the build command empty, and set the output directory to the root.

## Edit your content

- Text, projects and links: `index.html`
- Colors and fonts: the `:root` block at the top of `css/style.css`
- Add your GitHub profile link: add `<a href="https://github.com/<username>">GitHub</a>` next to the LinkedIn link in the Contact section of `index.html`
