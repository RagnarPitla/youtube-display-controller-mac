export const IPC = {
  LOAD_VIDEO: 'load-video',
  TRANSFORM_UPDATE: 'transform-update',
  PLAYBACK_COMMAND: 'playback-command',
  PLAYBACK_STATE: 'playback-state',
  PLAYER_READY: 'player-ready',
  GET_DISPLAYS: 'get-displays',
  MOVE_TO_DISPLAY: 'move-to-display',
  SHOW_LOGO: 'show-logo',
  OPEN_LOCAL_FILE: 'open-local-file',
  PLAY_LOCAL_FILE: 'play-local-file',
  VIDEO_FIT_MODE: 'video-fit-mode',
  LOOP_SETTINGS: 'loop-settings',
  BROWSE_FOLDER: 'browse-folder',
  SCAN_FOLDER: 'scan-folder',
  VOLUME_CHANGE: 'volume-change',
  SET_ALWAYS_ON_TOP: 'set-always-on-top'
} as const
