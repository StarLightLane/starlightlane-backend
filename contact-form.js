const BACKEND_URL = "https://starlightlane-backend.onrender.com/contact";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");

  if (!form) {
    console.warn("Contact form not found.");
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

    // Map volume slug to display string
    const volumeMap = {
      "under-10k":  "Under $10k",
      "10k-50k":    "$10k–$50k",
      "50k-250k":   "$50k–$250k",
      "250k-1m":    "$250k–$1M",
      "over-1m":    "Over $1M",
      "not-sure":   "Not sure yet",
    };

    // Map interest slug to display string
    const reasonMap = {
      "processing": "Lower my processing rate",
      "holdback":   "Recover a holdback or reserve",
      "ai":         "Add AI to my existing setup",
      "full":       "All of the above",
      "other":      "Something else",
    };

    const volumeRaw = form.querySelector('[name="volume"]')?.value;
    const reasonRaw = form.querySelector('[name="interest"]')?.value;

    const payload = {
      firstName:      form.querySelector('[name="fname"]')?.value.trim(),
      lastName:       form.querySelector('[name="lname"]')?.value.trim(),
      email:          form.querySelector('[name="email"]')?.value.trim(),
      company:        form.querySelector('[name="company"]')?.value.trim(),
      monthlyVolume:  volumeMap[volumeRaw] || volumeRaw,
      reason:         reasonMap[reasonRaw] || reasonRaw,
      additionalInfo: form.querySelector('[name="message"]')?.value.trim(),
    };

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        form.innerHTML = `
          <div style="text-align:center; padding: 2rem;">
            <p style="font-size: 1.25rem; font-weight: 600; color: var(--lime);">Thanks, ${payload.firstName}!</p>
            <p style="color: var(--bone-dim); margin-top: 8px;">We'll be in touch at ${payload.email} soon.</p>
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
