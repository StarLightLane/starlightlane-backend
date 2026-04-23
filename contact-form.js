// ─────────────────────────────────────────────────────────────────────────────
// Starlight Lane — Contact Form Handler
// Add this script to your contact page.
// ─────────────────────────────────────────────────────────────────────────────

const BACKEND_URL = "https://starlightlane-backend.onrender.com/contact";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form"); // update selector if needed

  if (!form) {
    console.warn("Contact form not found. Check the id on your <form> element.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn?.textContent;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    // Read field values — update the name/id selectors to match your HTML
    const payload = {
      firstName:      form.querySelector('[name="firstName"]')?.value.trim(),
      lastName:       form.querySelector('[name="lastName"]')?.value.trim(),
      email:          form.querySelector('[name="email"]')?.value.trim(),
      company:        form.querySelector('[name="company"]')?.value.trim(),
      monthlyVolume:  form.querySelector('[name="monthlyVolume"]')?.value,
      reason:         form.querySelector('[name="reason"]')?.value,
      additionalInfo: form.querySelector('[name="additionalInfo"]')?.value.trim(),
    };

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        // ✅ Success — customize this to match your site's UI
        form.innerHTML = `
          <div style="text-align:center; padding: 2rem;">
            <p style="font-size: 1.25rem; font-weight: 600;">Thanks, ${payload.firstName}!</p>
            <p>We'll be in touch at ${payload.email} soon.</p>
          </div>
        `;
      } else {
        alert(data.message || "Something went wrong. Please try again.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    } catch (err) {
      console.error("Form submission error:", err);
      alert("Network error. Please check your connection and try again.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });
});
