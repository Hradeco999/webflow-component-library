/*!
 * Webflow Component Library
 * https://github.com/Hradeco999/webflow-component-library
 * Licensed under the MIT License.
 * Independent community project; not affiliated with Webflow, Inc.
 */
(function (window, document) {
  "use strict";

  if (window.WebflowComponents) return;

  var SELECTORS = {
    filterGroup: "[data-wf-filter-group]",
    filterButton: "[data-wf-filter]",
    filterItem: "[data-wf-filter-item]",
    filterSearch: "[data-wf-filter-search]",
    filterEmpty: "[data-wf-filter-empty]",
    accordion: "[data-wf-accordion]",
    accordionTrigger: "[data-wf-accordion-trigger]",
    accordionPanel: "[data-wf-accordion-panel]",
    copy: "[data-wf-copy]",
    progress: "[data-wf-reading-progress]"
  };

  function normalize(value) {
    return String(value || "").trim().toLocaleLowerCase();
  }

  function initFilters(root) {
    var groups = (root || document).querySelectorAll(SELECTORS.filterGroup);

    groups.forEach(function (group) {
      if (group.dataset.wfInitialized === "true") return;
      group.dataset.wfInitialized = "true";

      var buttons = Array.from(group.querySelectorAll(SELECTORS.filterButton));
      var items = Array.from(group.querySelectorAll(SELECTORS.filterItem));
      var search = group.querySelector(SELECTORS.filterSearch);
      var empty = group.querySelector(SELECTORS.filterEmpty);
      var activeCategory = "all";

      function update() {
        var query = normalize(search ? search.value : "");
        var visibleCount = 0;

        items.forEach(function (item) {
          var categories = normalize(item.getAttribute("data-wf-category"))
            .split(",")
            .map(function (category) { return category.trim(); })
            .filter(Boolean);
          var categoryMatch = activeCategory === "all" || categories.indexOf(activeCategory) !== -1;
          var searchMatch = !query || normalize(item.textContent).indexOf(query) !== -1;
          var visible = categoryMatch && searchMatch;

          item.hidden = !visible;
          if (visible) visibleCount += 1;
        });

        buttons.forEach(function (button) {
          var selected = normalize(button.getAttribute("data-wf-filter")) === activeCategory;
          button.setAttribute("aria-pressed", String(selected));
        });

        if (empty) empty.hidden = visibleCount !== 0;
        group.setAttribute("data-wf-visible-count", String(visibleCount));
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeCategory = normalize(button.getAttribute("data-wf-filter")) || "all";
          update();
        });
      });

      if (search) search.addEventListener("input", update);
      update();
    });
  }

  var accordionId = 0;

  function initAccordions(root) {
    var groups = (root || document).querySelectorAll(SELECTORS.accordion);

    groups.forEach(function (group) {
      if (group.dataset.wfInitialized === "true") return;
      group.dataset.wfInitialized = "true";

      var allowMultiple = normalize(group.getAttribute("data-wf-accordion")) === "multiple";
      var triggers = Array.from(group.querySelectorAll(SELECTORS.accordionTrigger));
      var panels = Array.from(group.querySelectorAll(SELECTORS.accordionPanel));

      triggers.forEach(function (trigger, index) {
        var panelId = trigger.getAttribute("aria-controls");
        var panel = panelId ? panels.find(function (candidate) { return candidate.id === panelId; }) : panels[index];
        if (!panel) return;

        if (!panel.id) {
          panel.id = "wf-accordion-panel-" + (++accordionId);
        }
        trigger.setAttribute("aria-controls", panel.id);
        trigger.setAttribute("aria-expanded", String(!panel.hidden));

        trigger.addEventListener("click", function () {
          var shouldOpen = panel.hidden;

          if (!allowMultiple && shouldOpen) {
            triggers.forEach(function (otherTrigger) {
              var otherId = otherTrigger.getAttribute("aria-controls");
              var otherPanel = panels.find(function (candidate) { return candidate.id === otherId; });
              if (!otherPanel || otherPanel === panel) return;
              otherPanel.hidden = true;
              otherTrigger.setAttribute("aria-expanded", "false");
            });
          }

          panel.hidden = !shouldOpen;
          trigger.setAttribute("aria-expanded", String(shouldOpen));
        });
      });
    });
  }

  function initCopy(root) {
    var buttons = (root || document).querySelectorAll(SELECTORS.copy);

    buttons.forEach(function (button) {
      if (button.dataset.wfInitialized === "true") return;
      button.dataset.wfInitialized = "true";

      var originalLabel = button.textContent;
      var successLabel = button.getAttribute("data-wf-copy-success") || "Copied!";

      button.addEventListener("click", async function () {
        var value = button.getAttribute("data-wf-copy-value");
        var targetSelector = button.getAttribute("data-wf-copy");
        var target = null;
        try {
          if (targetSelector) target = document.querySelector(targetSelector);
        } catch (error) {
          button.dispatchEvent(new CustomEvent("wf-copy-error", { detail: error }));
          return;
        }

        if (value === null && target) value = target.textContent;
        if (value === null || value === undefined) return;

        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(value);
          } else {
            var temporary = document.createElement("textarea");
            temporary.value = value;
            temporary.setAttribute("readonly", "");
            temporary.style.position = "fixed";
            temporary.style.opacity = "0";
            document.body.appendChild(temporary);
            temporary.select();
            var copied = document.execCommand("copy");
            temporary.remove();
            if (!copied) throw new Error("Clipboard copy was not successful.");
          }

          button.dataset.wfCopied = "true";
          button.setAttribute("aria-live", "polite");
          button.textContent = successLabel;
          window.setTimeout(function () {
            delete button.dataset.wfCopied;
            button.textContent = originalLabel;
          }, 1800);
        } catch (error) {
          button.dispatchEvent(new CustomEvent("wf-copy-error", { detail: error }));
        }
      });
    });
  }

  var progressListening = false;

  function initProgress(root) {
    var bars = (root || document).querySelectorAll(SELECTORS.progress);
    if (!bars.length || progressListening) return;
    progressListening = true;

    var ticking = false;

    function update() {
      var doc = document.documentElement;
      var maxScroll = doc.scrollHeight - window.innerHeight;
      var progress = maxScroll > 0 ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100)) : 0;

      document.querySelectorAll(SELECTORS.progress).forEach(function (bar) {
        bar.style.width = progress.toFixed(2) + "%";
        bar.setAttribute("aria-valuenow", String(Math.round(progress)));
      });
      ticking = false;
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();
  }

  function init(options) {
    var root = options && options.root ? options.root : document;
    initFilters(root);
    initAccordions(root);
    initCopy(root);
    initProgress(root);
  }

  window.WebflowComponents = {
    init: init,
    version: "0.1.0"
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { init(); });
  } else {
    init();
  }
})(window, document);
