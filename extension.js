// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-
// Sample extension code, makes clicking on the panel show a message
const Gio = imports.gi.Gio;
const St = imports.gi.St;
const Meta = imports.gi.Meta;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const WORKSPACE_COUNT_KEY = 'workspace-count';
const WALLPAPER_KEY = 'workspace-wallpapers';
const BACKGROUND_SCHEMA = 'org.gnome.desktop.background';
const CURRENT_WALLPAPER_KEY = 'picture-uri';

let index = global.screen.get_active_workspace_index();

function debugLog(s) {
  // log(s);
}

function _changeWallpaper() {

  let pathSettings = Convenience.getSettings();
  let paths = pathSettings.get_strv(WALLPAPER_KEY);
  let backgroundSettings = new Gio.Settings({ schema_id: BACKGROUND_SCHEMA });

  debugLog("Walkpaper change from WS " + index);

  // Save wallpaper for previous WS if changed.
  let wallpaper = backgroundSettings.get_string(CURRENT_WALLPAPER_KEY);

  paths[index] = wallpaper;
  for (let i=0; i < index; i++) {
    // Fill in empty entries up to to current, otherwise set_strv fails
    if (typeof paths[i] === "undefined") {
      paths[i] = wallpaper;
    }
  }
  pathSettings.set_strv(WALLPAPER_KEY, paths);

  // Now get wallpaper for current workspace
  index = global.screen.get_active_workspace_index();
  debugLog("Walkpaper change WS to " + index);

  let wallpaper = paths[index];
  if ((typeof wallpaper === "undefined") || (wallpaper == "")) {
    wallpaper = paths[0];  // Default
  }
  debugLog("Walkpaper: " + wallpaper);
  backgroundSettings.set_string(CURRENT_WALLPAPER_KEY, wallpaper);
}

function _workspaceNumChanged() {
  let workspaceNum = Meta.prefs_get_num_workspaces();
  let pathSettings = Convenience.getSettings();
  pathSettings.set_int(WORKSPACE_COUNT_KEY, workspaceNum);
}

let signalId;

function init(metadata) {
  log("Walkpaper init");
  signalId = 0;
}

let wSwitchedSignalId;
let wAddedSignalId;
let wRemovedSignalId;

function enable() {
  log("Walkpaper enable");
  _workspaceNumChanged();
  wSwitchedSignalId = global.screen.connect('workspace-switched', _changeWallpaper);
  wAddedSignalId = global.screen.connect('workspace-added', _workspaceNumChanged);
  wRemovedSignalId = global.screen.connect('workspace-removed', _workspaceNumChanged);
  signalId = 1;
}

function disable() {
  log("Walkpaper disable");
  if (signalId) {
     global.screen.disconnect(wSwitchedSignalId);
     global.screen.disconnect(wAddedSignalId);
     global.screen.disconnect(wRemovedSignalId);
     signalId = 0;
  }
}
