import type { ChangeEvent, ReactElement, ReactNode } from "react";
import {
  Download,
  FolderOpen,
  ImagePlus,
  MousePointer2,
  Save,
  ScanSearch,
} from "lucide-react";
import type { ToolMode } from "../editor/model/figure";

interface AppToolbarProps {
  readonly activeTool: ToolMode;
  readonly onImport: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onOpenProject: () => void;
  readonly onSaveProject: () => void;
  readonly onToolChange: (tool: ToolMode) => void;
  readonly onExportFigure: () => void;
  readonly exportLabel: string;
}

export function AppToolbar({
  activeTool,
  onImport,
  onOpenProject,
  onSaveProject,
  onToolChange,
  onExportFigure,
  exportLabel,
}: AppToolbarProps): ReactElement {
  return (
    <header className="app-toolbar">
      <BrandBlock />
      <div className="toolbar-group">
        <label className="tool-button">
          <ImagePlus size={18} aria-hidden="true" />
          <span>Import</span>
          <input
            className="file-input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={onImport}
          />
        </label>
        <ToolButton
          label="Open"
          active={false}
          onClick={onOpenProject}
          icon={<FolderOpen size={18} aria-hidden="true" />}
        />
        <ToolButton
          label="Save"
          active={false}
          onClick={onSaveProject}
          icon={<Save size={18} aria-hidden="true" />}
        />
        <ToolButton
          label="Select"
          active={activeTool === "select"}
          onClick={() => onToolChange("select")}
          icon={<MousePointer2 size={18} aria-hidden="true" />}
        />
        <ToolButton
          label="ROI"
          active={activeTool === "roi"}
          onClick={() => onToolChange("roi")}
          icon={<ScanSearch size={18} aria-hidden="true" />}
        />
        <button className="tool-button" type="button" onClick={onExportFigure}>
          <Download size={18} aria-hidden="true" />
          <span>{exportLabel}</span>
        </button>
      </div>
    </header>
  );
}

function BrandBlock(): ReactElement {
  return (
    <div className="brand-block">
      <span className="brand-mark" />
      <span className="brand-name">Figure Composer</span>
    </div>
  );
}

interface ToolButtonProps {
  readonly label: string;
  readonly active: boolean;
  readonly icon: ReactNode;
  readonly onClick: () => void;
}

function ToolButton({
  label,
  active,
  icon,
  onClick,
}: ToolButtonProps): ReactElement {
  return (
    <button
      className={active ? "tool-button is-active" : "tool-button"}
      type="button"
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
