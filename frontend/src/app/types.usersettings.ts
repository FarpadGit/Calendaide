export const userSettingValues = {
  saveMode: ['auto', 'manual'] as const,
  saveModeLabel: ['Auto', 'Manuális'] as const,
};

export type userSettings = {
  saveMode: (typeof userSettingValues.saveMode)[number];
};
