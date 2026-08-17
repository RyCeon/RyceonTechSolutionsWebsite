/**
 * Contact form — client-side validation + async submit to Formspree.
 * Replace FORM_ENDPOINT below with your real Formspree endpoint
 * (https://formspree.io/f/YOUR_FORM_ID) to go live.
 */
(function () {
  "use strict";

  var FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var statusEl = document.getElementById("form-status");
  var submitBtn = form.querySelector('button[type="submit"]');

  var validators = {
    name: function (v) {
      return v.trim().length >= 2 ? "" : "Please enter your full name.";
    },
    email: function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email address.";
    },
    phone: function (v) {
      if (!v.trim()) return "";
      return /^[0-9+\-().\s]{7,}$/.test(v.trim()) ? "" : "Please enter a valid phone number.";
    },
    service: function (v) {
      return v ? "" : "Please select a service.";
    },
    message: function (v) {
      return v.trim().length >= 10 ? "" : "Tell us a little more (10+ characters).";
    }
  };

  function setFieldError(field, message) {
    var wrapper = field.closest(".form-field");
    if (!wrapper) return;
    var errorEl = wrapper.querySelector(".field-error");
    if (message) {
      wrapper.classList.add("has-error");
      if (errorEl) errorEl.textContent = message;
    } else {
      wrapper.classList.remove("has-error");
      if (errorEl) errorEl.textContent = "";
    }
  }

  function validateField(field) {
    var validator = validators[field.name];
    if (!validator) return true;
    var message = validator(field.value);
    setFieldError(field, message);
    return !message;
  }

  Object.keys(validators).forEach(function (name) {
    var field = form.elements[name];
    if (!field) return;
    field.addEventListener("blur", function () {
      validateField(field);
    });
  });

  function showStatus(type, message) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "form-status is-visible " + type;
    statusEl.setAttribute("role", type === "error" ? "alert" : "status");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var isValid = Object.keys(validators).every(function (name) {
      var field = form.elements[name];
      return field ? validateField(field) : true;
    });

    if (!isValid) {
      showStatus("error", "Please fix the highlighted fields and try again.");
      var firstError = form.querySelector(".has-error input, .has-error select, .has-error textarea");
      if (firstError) firstError.focus();
      return;
    }

    if (FORM_ENDPOINT.indexOf("YOUR_FORM_ID") !== -1) {
      showStatus(
        "error",
        "Form isn't connected yet — add your Formspree endpoint in js/form.js to enable submissions."
      );
      return;
    }

    submitBtn.disabled = true;
    submitBtn.dataset.originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form)
    })
      .then(function (response) {
        if (response.ok) {
          form.reset();
          showStatus("success", "Thanks! Your message has been sent — we'll be in touch within 1 business day.");
        } else {
          return response.json().then(function (data) {
            var message =
              data && data.errors && data.errors.length
                ? data.errors.map(function (err) { return err.message; }).join(", ")
                : "Something went wrong. Please try again or email us directly.";
            throw new Error(message);
          });
        }
      })
      .catch(function (err) {
        showStatus("error", err.message || "Something went wrong. Please try again or email us directly.");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText;
      });
  });
})();
