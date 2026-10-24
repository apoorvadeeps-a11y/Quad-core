import {
  InteractiveElementDescriptor,
  PageSnapshot,
  PlannedAction,
  AutofillMapping,
  UserAutofillProfile,
} from './types';

// In-memory mapping of temporary IDs (e.g. "e1", "e2") to actual DOM elements
let currentElementMap = new Map<string, HTMLElement>();
let currentSnapshotTimestamp = 0;

/**
 * Checks if an element is visible in the viewport and not hidden by styles
 */
export function isElementVisible(el: HTMLElement): boolean {
  if (!el || !el.isConnected) return false;

  const style = window.getComputedStyle(el);
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0' ||
    parseFloat(style.opacity) < 0.05
  ) {
    return false;
  }

  const rect = el.getBoundingClientRect();
  // Must have some geometry
  if (rect.width === 0 && rect.height === 0) {
    return false;
  }

  return true;
}

/**
 * Finds the nearest accessible label or heading for an input element
 */
function findAssociatedLabel(el: HTMLElement): string {
  // 1. Explicit <label for="...">
  if (el.id) {
    const labelEl = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(el.id)}"]`);
    if (labelEl && labelEl.textContent?.trim()) {
      return labelEl.textContent.trim();
    }
  }

  // 2. Wrapped <label><input ... /></label>
  const parentLabel = el.closest('label');
  if (parentLabel && parentLabel.textContent?.trim()) {
    return parentLabel.textContent.trim();
  }

  // 3. aria-label or aria-labelledby
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel?.trim()) return ariaLabel.trim();

  const ariaLabelledBy = el.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const target = document.getElementById(ariaLabelledBy);
    if (target && target.textContent?.trim()) {
      return target.textContent.trim();
    }
  }

  // 4. placeholder or title
  const placeholder = el.getAttribute('placeholder');
  if (placeholder?.trim()) return placeholder.trim();

  const title = el.getAttribute('title');
  if (title?.trim()) return title.trim();

  // 5. Nearest previous sibling text or heading
  let prev = el.previousElementSibling;
  while (prev) {
    if (
      prev.tagName.match(/^H[1-6]$/i) ||
      prev.tagName === 'LABEL' ||
      prev.classList.contains('label')
    ) {
      if (prev.textContent?.trim()) {
        return prev.textContent.trim();
      }
    }
    prev = prev.previousElementSibling;
  }

  return '';
}

/**
 * Extracts visible section heading context
 */
function findSectionContext(el: HTMLElement): string {
  const container = el.closest('section, article, form, [role="region"], [role="tabpanel"], nav, main');
  if (container) {
    const heading = container.querySelector('h1, h2, h3, h4, [role="heading"]');
    if (heading && heading.textContent?.trim()) {
      return heading.textContent.trim();
    }
  }
  return '';
}

/**
 * Privacy filter: checks if an input field is sensitive (password, card, cvv)
 */
function isSensitiveField(el: HTMLElement): boolean {
  if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') return false;

  const input = el as HTMLInputElement;
  const type = (input.type || '').toLowerCase();
  if (type === 'password') return true;

  const name = (input.name || '').toLowerCase();
  const id = (input.id || '').toLowerCase();
  const autocomplete = (input.autocomplete || '').toLowerCase();
  const label = findAssociatedLabel(el).toLowerCase();

  const sensitiveKeywords = [
    'password',
    'passwd',
    'pin',
    'cvv',
    'cvc',
    'cardnumber',
    'creditcard',
    'card_number',
    'cc_num',
    'socialsecurity',
    'ssn',
    'auth_token',
    'secret',
  ];

  return sensitiveKeywords.some(
    (kw) =>
      name.includes(kw) ||
      id.includes(kw) ||
      autocomplete.includes(kw) ||
      label.includes(kw)
  );
}

/**
 * Scans the current document and produces a compact PageSnapshot with e1..eN descriptors.
 */
export function extractPageSnapshot(rootElement: Document | HTMLElement = document): PageSnapshot {
  // Clear stale map
  currentElementMap.clear();
  currentSnapshotTimestamp = Date.now();

  const headings: string[] = [];
  const descriptors: InteractiveElementDescriptor[] = [];

  // 1. Gather page headings for context
  const headingElements = rootElement.querySelectorAll<HTMLElement>('h1, h2, h3');
  headingElements.forEach((h) => {
    if (isElementVisible(h) && h.textContent?.trim()) {
      headings.push(h.textContent.trim().slice(0, 100));
    }
  });

  // 2. Query all interactive elements
  const interactiveQuery =
    'a[href], button, input, select, textarea, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [tabindex="0"]';
  const nodes = rootElement.querySelectorAll<HTMLElement>(interactiveQuery);

  let idCounter = 1;
  let totalFound = 0;
  let filteredCount = 0;

  nodes.forEach((node) => {
    totalFound++;

    // Visibility and privacy check
    if (!isElementVisible(node)) return;

    if (isSensitiveField(node)) {
      filteredCount++;
      return;
    }

    const tagName = node.tagName.toLowerCase();
    const inputType = (node as HTMLInputElement).type?.toLowerCase();

    // Ignore hidden or submit tracking pixels
    if (inputType === 'hidden') return;

    const accessibleName = findAssociatedLabel(node);
    let visibleText = node.innerText?.trim() || node.textContent?.trim() || '';
    if (visibleText.length > 120) {
      visibleText = visibleText.slice(0, 117) + '...';
    }

    const placeholder = node.getAttribute('placeholder') || undefined;
    const role = node.getAttribute('role') || undefined;
    const context = findSectionContext(node) || undefined;
    const disabled = (node as HTMLInputElement).disabled || node.getAttribute('aria-disabled') === 'true';
    const required = (node as HTMLInputElement).required || node.getAttribute('aria-required') === 'true';

    let currentValue: string | undefined = undefined;
    let checked: boolean | undefined = undefined;

    if (tagName === 'input' || tagName === 'textarea') {
      const input = node as HTMLInputElement;
      if (input.type === 'checkbox' || input.type === 'radio') {
        checked = input.checked;
      } else {
        currentValue = input.value?.slice(0, 80);
      }
    } else if (tagName === 'select') {
      const select = node as HTMLSelectElement;
      const selectedOption = select.options[select.selectedIndex];
      currentValue = selectedOption ? selectedOption.text : undefined;
    }

    // Skip elements with absolutely no text, label, or placeholder
    if (!visibleText && !accessibleName && !placeholder && tagName !== 'input' && tagName !== 'select') {
      return;
    }

    const elementId = `e${idCounter++}`;
    currentElementMap.set(elementId, node);

    // Save temporary data-onestep-eid attribute for fast inspection
    node.setAttribute('data-onestep-eid', elementId);

    descriptors.push({
      id: elementId,
      tag: tagName,
      type: inputType,
      text: visibleText,
      accessibleName,
      role,
      context,
      placeholder,
      currentValue,
      checked,
      disabled,
      required,
      isClickable: tagName === 'button' || tagName === 'a' || role === 'button' || role === 'link' || inputType === 'submit',
    });
  });

  return {
    url: window.location.href,
    title: document.title || 'Untitled Page',
    headings: headings.slice(0, 10),
    elements: descriptors.slice(0, 60), // Bound size for LLM context limits
    timestamp: currentSnapshotTimestamp,
    totalElementsFound: totalFound,
    filteredCount,
  };
}

/**
 * Retrieves the live DOM element for a temporary identifier
 */
export function getElementById(elementId: string): HTMLElement | null {
  const cached = currentElementMap.get(elementId);
  if (cached && cached.isConnected && isElementVisible(cached)) {
    return cached;
  }
  // Fallback: look up by attribute
  const byAttr = document.querySelector<HTMLElement>(`[data-onestep-eid="${elementId}"]`);
  if (byAttr && byAttr.isConnected && isElementVisible(byAttr)) {
    currentElementMap.set(elementId, byAttr);
    return byAttr;
  }
  return null;
}

/**
 * Safely executes a planned action on the DOM
 */
export function executeDomAction(action: PlannedAction): { success: boolean; message: string } {
  if (!action.element_id) {
    if (action.type === 'wait_and_reinspect' || action.type === 'finish') {
      return { success: true, message: action.reason || 'Action accepted.' };
    }
    return { success: false, message: 'No element_id specified for action.' };
  }

  const el = getElementById(action.element_id);
  if (!el) {
    return {
      success: false,
      message: `Element ${action.element_id} no longer exists or is not visible on this page. Re-inspecting DOM...`,
    };
  }

  try {
    switch (action.type) {
      case 'click':
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
        el.click();
        return { success: true, message: `Clicked element [${action.element_id}]: ${action.reason}` };

      case 'fill': {
        const input = el as HTMLInputElement | HTMLTextAreaElement;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus();
        input.value = action.value || '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true }));
        return {
          success: true,
          message: `Filled element [${action.element_id}] with "${action.value}".`,
        };
      }

      case 'select_option': {
        const select = el as HTMLSelectElement;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (action.value) {
          const valLower = action.value.toLowerCase();
          for (let i = 0; i < select.options.length; i++) {
            const opt = select.options[i];
            if (
              opt.value.toLowerCase() === valLower ||
              opt.text.toLowerCase().includes(valLower)
            ) {
              select.selectedIndex = i;
              select.dispatchEvent(new Event('change', { bubbles: true }));
              break;
            }
          }
        }
        return { success: true, message: `Selected option "${action.value}" in [${action.element_id}].` };
      }

      case 'scroll':
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return { success: true, message: `Scrolled to element [${action.element_id}].` };

      case 'highlight':
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return { success: true, message: `Highlighted element [${action.element_id}].` };

      default:
        return { success: false, message: `Unsupported action type: ${action.type}` };
    }
  } catch (err) {
    return { success: false, message: `Failed executing action on ${action.element_id}: ${String(err)}` };
  }
}

/**
 * Maps a UserAutofillProfile to detected page inputs
 */
export function generateAutofillMappings(
  elements: InteractiveElementDescriptor[],
  profile: Partial<UserAutofillProfile>
): AutofillMapping[] {
  const mappings: AutofillMapping[] = [];

  elements.forEach((el) => {
    if (el.tag !== 'input' && el.tag !== 'textarea' && el.tag !== 'select') return;
    if (el.disabled) return;

    const labelLower = (el.accessibleName || el.placeholder || el.text || '').toLowerCase();
    const typeLower = (el.type || '').toLowerCase();

    // Name matching
    if (profile.fullName && (labelLower.includes('name') || labelLower.includes('student name') || labelLower.includes('full name'))) {
      if (!labelLower.includes('first') && !labelLower.includes('last') && !labelLower.includes('user')) {
        mappings.push({
          element_id: el.id,
          field_label: el.accessibleName || 'Full Name',
          field_type: 'text',
          proposed_value: profile.fullName,
          confidence: 0.92,
        });
      }
    }

    // Email matching
    if (profile.email && (typeLower === 'email' || labelLower.includes('email') || labelLower.includes('e-mail'))) {
      mappings.push({
        element_id: el.id,
        field_label: el.accessibleName || 'Email',
        field_type: 'email',
        proposed_value: profile.email,
        confidence: 0.98,
      });
    }

    // Phone matching
    if (profile.phone && (typeLower === 'tel' || labelLower.includes('phone') || labelLower.includes('mobile') || labelLower.includes('contact'))) {
      mappings.push({
        element_id: el.id,
        field_label: el.accessibleName || 'Phone',
        field_type: 'tel',
        proposed_value: profile.phone,
        confidence: 0.95,
      });
    }

    // Student ID / Roll number matching
    if (profile.studentId && (labelLower.includes('roll') || labelLower.includes('student id') || labelLower.includes('registration') || labelLower.includes('id number'))) {
      mappings.push({
        element_id: el.id,
        field_label: el.accessibleName || 'Student ID',
        field_type: 'text',
        proposed_value: profile.studentId,
        confidence: 0.94,
      });
    }

    // Date of Birth matching
    if (profile.dateOfBirth && (typeLower === 'date' || labelLower.includes('birth') || labelLower.includes('dob'))) {
      mappings.push({
        element_id: el.id,
        field_label: el.accessibleName || 'Date of Birth',
        field_type: 'date',
        proposed_value: profile.dateOfBirth,
        confidence: 0.91,
      });
    }

    // Address matching
    if (profile.address && (labelLower.includes('address') || labelLower.includes('street'))) {
      mappings.push({
        element_id: el.id,
        field_label: el.accessibleName || 'Address',
        field_type: 'text',
        proposed_value: profile.address,
        confidence: 0.88,
      });
    }
  });

  return mappings;
}
