export default function GettingStartedArticle() {
  return (
    <article className="prose max-w-2xl py-10">
      <h1>Getting started</h1>
      <p>
        Welcome to Tutorbot! This covers the basics of the editor and hints.
      </p>
      <ol>
        <li>
          Open <code>/app</code>.
        </li>
        <li>Type text + LaTeX; we render with KaTeX.</li>
        <li>Click “Get Hint” to reveal step-by-step guidance.</li>
      </ol>
    </article>
  );
}
