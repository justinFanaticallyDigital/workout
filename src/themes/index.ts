import { ThemeConfig } from './types';
import { defaultTheme } from './default';
import { graffiti } from './graffiti';
import { cyberpunk } from './cyberpunk';
import { notebook } from './notebook';
import { blueprint } from './blueprint';
import { arcade } from './arcade';
import { lab } from './lab';
import { iron } from './iron';

export type { ThemeConfig } from './types';

export const themes: Record<string, ThemeConfig> = {
  default: defaultTheme,
  graffiti,
  cyberpunk,
  notebook,
  blueprint,
  arcade,
  lab,
  iron,
};

export const themeList = Object.values(themes);

export { defaultTheme, graffiti, cyberpunk, notebook, blueprint, arcade, lab, iron };
