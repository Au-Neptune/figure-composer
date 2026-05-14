use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;
use std::fs;
use std::path::{Component, Path, PathBuf};

const PROJECT_ASSETS_DIR_NAME: &str = "assets";
const PROJECT_JSON_FILE_NAME: &str = "project.json";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveProjectFolderRequest {
    root_path: String,
    project_json_text: String,
    assets: Vec<ProjectAssetPayload>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectAssetPayload {
    file_name: String,
    bytes: Vec<u8>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OpenProjectFolderResponse {
    project_json_text: String,
    assets: Vec<ProjectAssetPayload>,
}

#[derive(Deserialize)]
struct ProjectJsonManifest {
    figure: ProjectFigureManifest,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProjectFigureManifest {
    source_images: Vec<ProjectSourceImageManifest>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProjectSourceImageManifest {
    asset_file_name: String,
}

#[tauri::command]
pub fn save_project_folder(request: SaveProjectFolderRequest) -> Result<(), String> {
    validate_save_request(&request)?;
    let root = require_root_path(&request.root_path)?;
    let assets_dir = root.join(PROJECT_ASSETS_DIR_NAME);
    fs::create_dir_all(&assets_dir)
        .map_err(|error| format!("Failed to create assets directory: {error}"))?;
    for asset in &request.assets {
        write_project_asset(&assets_dir, asset)?;
    }
    fs::write(root.join(PROJECT_JSON_FILE_NAME), request.project_json_text)
        .map_err(|error| format!("Failed to write project.json: {error}"))
}

#[tauri::command]
pub fn open_project_folder(root_path: String) -> Result<OpenProjectFolderResponse, String> {
    let root = require_root_path(&root_path)?;
    let project_json_text = fs::read_to_string(root.join(PROJECT_JSON_FILE_NAME))
        .map_err(|error| format!("Failed to read project.json: {error}"))?;
    let asset_file_names = parse_asset_file_names(&project_json_text)?;
    let assets = asset_file_names
        .iter()
        .map(|file_name| read_project_asset(&root, file_name))
        .collect::<Result<Vec<_>, _>>()?;
    Ok(OpenProjectFolderResponse {
        project_json_text,
        assets,
    })
}

fn validate_save_request(request: &SaveProjectFolderRequest) -> Result<(), String> {
    let expected = parse_asset_file_names(&request.project_json_text)?;
    let provided = request
        .assets
        .iter()
        .map(|asset| validate_asset_file_name(&asset.file_name))
        .collect::<Result<BTreeSet<_>, _>>()?;
    if expected != provided {
        return Err("Project JSON asset list does not match provided assets.".to_string());
    }
    Ok(())
}

fn parse_asset_file_names(project_json_text: &str) -> Result<BTreeSet<String>, String> {
    let manifest: ProjectJsonManifest = serde_json::from_str(project_json_text)
        .map_err(|error| format!("Invalid project.json: {error}"))?;
    manifest
        .figure
        .source_images
        .into_iter()
        .map(|source_image| validate_asset_file_name(&source_image.asset_file_name))
        .collect()
}

fn write_project_asset(assets_dir: &Path, asset: &ProjectAssetPayload) -> Result<(), String> {
    let file_name = validate_asset_file_name(&asset.file_name)?;
    fs::write(assets_dir.join(&file_name), &asset.bytes)
        .map_err(|error| format!("Failed to write project asset {file_name}: {error}"))
}

fn read_project_asset(root: &Path, file_name: &str) -> Result<ProjectAssetPayload, String> {
    let valid_file_name = validate_asset_file_name(file_name)?;
    let path = root.join(PROJECT_ASSETS_DIR_NAME).join(&valid_file_name);
    let bytes = fs::read(path)
        .map_err(|error| format!("Failed to read project asset {valid_file_name}: {error}"))?;
    Ok(ProjectAssetPayload {
        file_name: valid_file_name,
        bytes,
    })
}

fn require_root_path(root_path: &str) -> Result<PathBuf, String> {
    if root_path.trim().is_empty() {
        return Err("Project folder path is empty.".to_string());
    }
    Ok(PathBuf::from(root_path))
}

fn validate_asset_file_name(file_name: &str) -> Result<String, String> {
    if file_name.trim().is_empty() {
        return Err("Project asset file name is empty.".to_string());
    }
    let mut components = Path::new(file_name).components();
    let is_valid_file_name =
        matches!(components.next(), Some(Component::Normal(_))) && components.next().is_none();
    if !is_valid_file_name {
        return Err(format!("Invalid project asset file name: {file_name}"));
    }
    Ok(file_name.to_string())
}
