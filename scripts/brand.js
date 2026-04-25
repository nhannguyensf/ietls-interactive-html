(function () {
  const brandName = "Ms Haley IELTS";
  const facebookUrl = "https://www.facebook.com/Ms.Haley.IELTS";

  function renderBrandFooter() {
    document.querySelectorAll("[data-brand-footer]").forEach(footer => {
      footer.textContent = "";

      const brand = document.createElement("span");
      brand.textContent = brandName;

      const separator = document.createTextNode(" | ");

      const link = document.createElement("a");
      link.href = facebookUrl;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Facebook";

      footer.append(brand, separator, link);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderBrandFooter);
  } else {
    renderBrandFooter();
  }
})();
