(function() {
  function getSelectionRange(savedRange) {
    if (savedRange) return savedRange;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && selection.toString().trim() !== "") {
      return selection.getRangeAt(0);
    }

    return null;
  }

  function rangeIntersectsNode(range, node) {
    if (typeof range.intersectsNode === "function") {
      return range.intersectsNode(node);
    }

    const nodeRange = document.createRange();
    nodeRange.selectNodeContents(node);
    return range.compareBoundaryPoints(Range.END_TO_START, nodeRange) > 0 &&
      range.compareBoundaryPoints(Range.START_TO_END, nodeRange) < 0;
  }

  function collectTextSlices(range, root, acceptNode) {
    const slices = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!acceptNode(node)) return NodeFilter.FILTER_REJECT;
        return rangeIntersectsNode(range, node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    while (walker.nextNode()) {
      const node = walker.currentNode;
      let start = node === range.startContainer ? range.startOffset : 0;
      let end = node === range.endContainer ? range.endOffset : node.nodeValue.length;

      if (start < 0) start = 0;
      if (end > node.nodeValue.length) end = node.nodeValue.length;
      if (start < end) slices.push({ node, start, end });
    }

    return slices;
  }

  function applyHighlightToRange(range, root, color) {
    const highlights = collectTextSlices(range, root, node => {
      const parent = node.parentElement;
      if (!node.nodeValue.trim() || !parent) return false;
      return !parent.closest("input, textarea, select, option, button, audio, iframe");
    });

    highlights.reverse().forEach(({ node, start, end }) => {
      const after = end < node.nodeValue.length ? node.splitText(end) : node.nextSibling;
      const selected = start > 0 ? node.splitText(start) : node;
      const mark = document.createElement("mark");
      mark.className = "user-highlight-" + color;
      selected.parentNode.insertBefore(mark, after);
      mark.appendChild(selected);
    });
  }

  function clearSelectedHighlights(range, root) {
    const highlights = collectTextSlices(range, root, node => {
      const mark = node.parentElement && node.parentElement.closest("mark[class^='user-highlight-']");
      return Boolean(node.nodeValue && mark);
    });

    highlights.reverse().forEach(({ node, start, end }) => {
      const mark = node.parentElement.closest("mark[class^='user-highlight-']");
      if (!mark || mark.childNodes.length !== 1 || mark.firstChild !== node) return;

      const text = node.nodeValue;
      const beforeText = text.slice(0, start);
      const selectedText = text.slice(start, end);
      const afterText = text.slice(end);
      const parent = mark.parentNode;

      if (beforeText) {
        const beforeMark = mark.cloneNode(false);
        beforeMark.textContent = beforeText;
        parent.insertBefore(beforeMark, mark);
      }

      if (selectedText) {
        parent.insertBefore(document.createTextNode(selectedText), mark);
      }

      if (afterText) {
        const afterMark = mark.cloneNode(false);
        afterMark.textContent = afterText;
        parent.insertBefore(afterMark, mark);
      }

      parent.removeChild(mark);
    });

    return highlights.length;
  }

  function createHighlightTools(options) {
    let savedRange = null;
    const popupWidth = options.popupWidth || 190;

    function getPopup() {
      return document.getElementById(options.popupId);
    }

    function getActiveRoot() {
      return document.querySelector(options.activeRootSelector);
    }

    function hidePopup() {
      const popup = getPopup();
      if (popup) popup.classList.remove("visible");
    }

    function updatePopup() {
      const selection = window.getSelection();
      const popup = getPopup();
      const activeRoot = getActiveRoot();

      if (!selection || !popup || !activeRoot || selection.rangeCount === 0 || selection.toString().trim() === "") {
        hidePopup();
        return;
      }

      const range = selection.getRangeAt(0);
      if (!activeRoot.contains(range.commonAncestorContainer)) {
        hidePopup();
        return;
      }

      savedRange = range.cloneRange();

      const rect = range.getBoundingClientRect();
      let left = rect.left + rect.width / 2 - popupWidth / 2;
      let top = rect.top - 52;

      if (left < 10) left = 10;
      if (left + popupWidth > window.innerWidth - 10) left = window.innerWidth - popupWidth - 10;
      if (top < 10) top = rect.bottom + 12;

      popup.style.left = left + "px";
      popup.style.top = top + "px";
      popup.classList.add("visible");
    }

    function highlightSelection(color) {
      const activeRoot = getActiveRoot();
      const range = getSelectionRange(savedRange);

      if (!range || !activeRoot || !activeRoot.contains(range.commonAncestorContainer)) {
        alert(options.selectTextMessage);
        hidePopup();
        return;
      }

      applyHighlightToRange(range, activeRoot, color);
      clearSelection();
      savedRange = null;
      hidePopup();
    }

    function clearHighlights() {
      const activeRoot = getActiveRoot();
      if (!activeRoot) return;

      const range = getSelectionRange(savedRange);
      if (!range || !activeRoot.contains(range.commonAncestorContainer)) {
        alert(options.selectHighlightMessage);
        hidePopup();
        return;
      }

      const cleared = clearSelectedHighlights(range, activeRoot);
      if (!cleared) alert(options.emptyHighlightMessage);

      activeRoot.normalize();
      clearSelection();
      savedRange = null;
      hidePopup();
    }

    function clearSelection() {
      const selection = window.getSelection();
      if (selection) selection.removeAllRanges();
    }

    document.addEventListener("mouseup", function() {
      setTimeout(updatePopup, 10);
    });

    document.addEventListener("keyup", function() {
      setTimeout(updatePopup, 10);
    });

    document.addEventListener("mousedown", function(event) {
      const popup = getPopup();
      if (popup && !popup.contains(event.target)) hidePopup();
    });

    window.addEventListener("scroll", hidePopup, true);
    window.addEventListener("resize", hidePopup);

    return {
      clearHighlights,
      hidePopup,
      highlightSelection,
      updatePopup
    };
  }

  window.HighlightTools = {
    create: createHighlightTools
  };
})();
