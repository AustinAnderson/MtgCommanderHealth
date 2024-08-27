export const AudioCue = {
  LifeLost: 'lifeLost',
  Healed: 'healed',
  Died: 'died',
  CommanderSummoned: 'commanderSummoned',
  Nuke: 'nuke',
  Yoink: 'yoink',
  Scream: 'wow'
} as const;
export type AudioCue = typeof AudioCue[keyof typeof AudioCue]
