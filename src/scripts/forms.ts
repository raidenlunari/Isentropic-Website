// Progressive enhancement for Netlify forms.
//
// Without this script (or if it fails to load), every `form[data-netlify]`
// still works: it is a plain HTML form with `method="POST"` and an
// `action` pointing at /thanks, so the browser performs a normal
// navigation and Netlify's form-handling backend receives the submission.
//
// With this script, a valid submission is instead sent via `fetch` and
// the result is reported inline in the form's `.form-status` region,
// without navigating away. An invalid submission is left alone entirely
// so the browser's native constraint-validation UI (bubble messages,
// `:invalid` styling) still appears.
export function enhanceForms(): void {
  const forms = document.querySelectorAll<HTMLFormElement>("form[data-netlify]");
  forms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      // Let the browser show its own messages and fall back to a real POST.
      if (!form.checkValidity()) return;
      event.preventDefault();

      const status = form.querySelector<HTMLElement>(".form-status");
      const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (button) button.disabled = true;
      if (status) status.textContent = "Sending…";

      try {
        const response = await fetch(form.getAttribute("action") ?? "/", {
          method: "POST",
          body: new FormData(form),
        });
        if (!response.ok) throw new Error(`Server responded ${response.status}`);
        form.reset();
        if (status) status.textContent = "Received. We will respond by email.";
      } catch (error) {
        if (status) {
          status.textContent =
            "The submission did not go through. Check your connection and send again.";
        }
        if (button) button.disabled = false;
        return;
      }
      if (button) button.disabled = false;
    });
  });
}
