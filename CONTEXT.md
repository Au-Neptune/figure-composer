# Figure Composer

Figure Composer is a tool for composing publication- and report-ready figures from source images, annotations, insets, and export settings.

## Language

**Figure**:
A composed visual artifact intended for a report, paper, presentation, or poster.
_Avoid_: Image, collage, canvas

**Source Image**:
An imported image used as material inside a **Figure**.
_Avoid_: Picture, photo, raw image

**Referenced Source Image**:
A **Source Image** that is used by a **Region Of Interest**, **Inset**, or **Scale Bar** and must no longer be directly modified.
_Avoid_: Locked file, finalized image

**Derived Source Image**:
A new **Source Image** produced from an **Image Operation** on another **Source Image**.
_Avoid_: Version, modified original, copy

**Inset**:
A linked visual element that shows a magnified or cropped region from a **Source Image**.
_Avoid_: Zoom image, cropped copy, magnifier

**Inset Display Size**:
The layout size of an **Inset** within a **Figure**.
_Avoid_: Magnification, zoom level

**Inset Magnification**:
The scale relationship between a **Region Of Interest** and its linked **Inset** when precision sizing is enabled.
_Avoid_: Display size, visual size

**Region Of Interest**:
A selected area on a **Source Image** that defines the content shown by a linked **Inset**.
_Avoid_: Selection, crop box, zoom area

**ROI Frame**:
A visible annotation that marks a **Region Of Interest** on its **Source Image**.
_Avoid_: Control box, selection outline, editor handle

**Image Operation**:
An editing action that safely supports **Figure** composition without becoming scientific analysis or photo retouching.
_Avoid_: Main workflow, standalone editor feature, scientific analysis, photo retouching

**Scale Bar**:
A measurement annotation that represents real-world length on a calibrated **Source Image**.
_Avoid_: Line, ruler, decorative label

**Export Preset**:
A reusable set of output settings for producing a file from a **Figure**.
_Avoid_: Export history, output file, render log

**Project**:
A portable package that stores a **Figure** and its required source assets.
_Avoid_: Single JSON file, loose document, path list

**Figure Layout**:
The spatial arrangement of visual elements within a **Figure**.
_Avoid_: Template, slide, document page

**Figure Preview**:
The WYSIWYG editing view that represents the current **Figure**.
_Avoid_: Separate live preview, thumbnail, export render

**Export Preview**:
A pre-export view for checking output settings against the current **Figure**.
_Avoid_: Editing canvas, export history, saved output

**Layout Guide**:
An optional alignment aid used while arranging a **Figure Layout**.
_Avoid_: Layout rule, template constraint, required grid

**Panel**:
A primary subfigure unit within a **Figure**.
_Avoid_: Element, inset, annotation

**Panel Label**:
A label that identifies a **Panel** within a **Figure**, usually with letters such as A, B, or C.
_Avoid_: Text box, caption, title

**Panel Order**:
The sequence used to derive automatic **Panel Labels** within a **Figure**.
_Avoid_: Layer order, z-index, visual stacking

**Generic Annotation**:
A non-measurement visual note used to clarify content within a **Figure**.
_Avoid_: ROI Frame, Scale Bar, Panel Label

## Relationships

- A **Figure** contains one or more **Source Images**.
- A **Project** contains one **Figure**.
- A **Project** includes the source assets required by its **Figure**.
- A **Figure** may contain zero or more **Insets**.
- An **Inset** is linked to exactly one **Region Of Interest**.
- An **Inset** has an **Inset Display Size** by default.
- An **Inset** may use **Inset Magnification** when precision sizing is needed.
- A **Region Of Interest** belongs to exactly one **Source Image**.
- A **Source Image** becomes a **Referenced Source Image** once it is used by a **Region Of Interest**, **Inset**, or **Scale Bar**.
- A **Referenced Source Image** may produce a **Derived Source Image** through an **Image Operation**.
- A **Derived Source Image** does not replace the **Source Image** it came from.
- A **Region Of Interest** has one default **ROI Frame** when created for an **Inset**.
- An **ROI Frame** may be hidden or restyled without removing its **Region Of Interest**.
- A **Scale Bar** belongs to a calibrated **Source Image** or a visual element derived from one.
- A **Figure** may have one or more **Export Presets**.
- An **Export Preset** does not track individual exported files.
- A **Figure** has one **Figure Layout**.
- A **Figure Preview** represents the current **Figure** during editing.
- An **Export Preview** is used before producing an exported file.
- A **Figure** may contain zero or more **Panels**.
- A **Panel** may have one **Panel Label**.
- A **Panel Label** is derived from **Panel Order** unless it is manually overridden.
- **Panel Order** is distinct from visual stacking order.
- An **Inset** is not a **Panel** unless it is intentionally used as a primary subfigure unit.
- **ROI Frames**, **Scale Bars**, and **Panel Labels** are semantic annotations, not **Generic Annotations**.
- **Generic Annotations** include ordinary arrows, text notes, lines, and shapes.
- **Image Operations** exclude scientific analysis and photo retouching.
- A **Figure Layout** may use zero or more **Layout Guides**.
- A **Layout Guide** assists arrangement but does not define the **Figure**.
- An **Image Operation** supports **Figure** composition; it is not the product's primary artifact.

## Example Dialogue

> **Dev:** "When the user crops an imported file, are they editing the original **Source Image**?"
> **Domain expert:** "No. Cropping is an **Image Operation** used to create or adjust elements inside the **Figure**."
>
> **Dev:** "Should **Image Operations** include thresholding, measurement analysis, or retouching?"
> **Domain expert:** "No. They are limited to figure-safe composition and output needs."
>
> **Dev:** "If a **Region Of Interest** changes, should the **Inset** keep showing the old crop?"
> **Domain expert:** "No. A linked **Inset** updates from its **Region Of Interest**."
>
> **Dev:** "Is the red rectangle just an editor control?"
> **Domain expert:** "No. It is an **ROI Frame** that is visible in the **Figure** by default."
>
> **Dev:** "When the user drags an **Inset** larger, are they setting scientific magnification?"
> **Domain expert:** "No. They are changing **Inset Display Size** unless precision sizing is enabled."
>
> **Dev:** "Can we treat a **Scale Bar** as just a line with text?"
> **Domain expert:** "No. A **Scale Bar** represents calibrated real-world length, even if it is implemented later."
>
> **Dev:** "Can the user still crop or resize a **Source Image** after creating an **Inset** from it?"
> **Domain expert:** "No. Once referenced, it becomes a **Referenced Source Image** and direct modification is blocked."
>
> **Dev:** "If the user still needs a cropped version of a **Referenced Source Image**, what happens?"
> **Domain expert:** "The crop creates a **Derived Source Image** instead of modifying the referenced one."
>
> **Dev:** "Does the project remember every exported PNG?"
> **Domain expert:** "No. It remembers **Export Presets**, not individual output files."
>
> **Dev:** "Can a **Project** depend only on image paths elsewhere on disk?"
> **Domain expert:** "No. A **Project** includes the source assets required by its **Figure**."
>
> **Dev:** "Does choosing a guide force the **Figure** into a fixed template?"
> **Domain expert:** "No. A **Layout Guide** helps align a free **Figure Layout**."
>
> **Dev:** "Is live preview a second panel beside the editor?"
> **Domain expert:** "No. The **Figure Preview** is the WYSIWYG editing view; **Export Preview** appears before export."
>
> **Dev:** "Is every visual object in the **Figure** a **Panel**?"
> **Domain expert:** "No. A **Panel** is a primary subfigure unit, not an **Inset** or annotation by default."
>
> **Dev:** "If **Panel B** is deleted, should **Panel C** become **Panel B**?"
> **Domain expert:** "Yes, unless the **Panel Label** was manually overridden."
>
> **Dev:** "Should a **Scale Bar** be treated like an ordinary drawn line?"
> **Domain expert:** "No. It is a semantic annotation; ordinary arrows and notes are **Generic Annotations**."

## Flagged Ambiguities

- "Image" was used for both imported material and final output; resolved: the primary artifact is a **Figure**, while imported files are **Source Images**.
- "Insect" was used once to mean **Inset**; resolved: the canonical term is **Inset**.
