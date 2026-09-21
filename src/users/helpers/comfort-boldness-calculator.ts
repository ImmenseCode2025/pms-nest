import _ from 'lodash';
import {
  AspiringStyleEnum,
  ColorPaletteEnum,
  CurrentStyleEnum,
} from 'src/core/helper/enum/global.enum';

export class ComfortBoldnessCalculator {
  // ✅ only change these weights when you want different results
  static COMFORT_DELTA_MAP: Record<string, number> = {
    // Current styles
    [CurrentStyleEnum.CASUAL]: 10,
    [CurrentStyleEnum.CASUAL_AND_RELAXED]: 10,
    [CurrentStyleEnum.BUSINESS_PROFESSIONAL]: -10,
    [CurrentStyleEnum.STREETWEAR]: -5,
    [CurrentStyleEnum.MINIMALIST]: 8,
    [CurrentStyleEnum.VINTAGE]: 3,
    [CurrentStyleEnum.ATHLEISURE]: 7,

    // Aspiring styles
    [AspiringStyleEnum.ELEVATED_CASUAL]: 5,
    [AspiringStyleEnum.CLASSIC_AND_TIMELESS]: 10,
    [AspiringStyleEnum.ELEGANT_AND_REFINED]: 8,
    [AspiringStyleEnum.MODERN_AND_CLEAN]: 8,
    [AspiringStyleEnum.BOLD_AND_EXPERIMENTAL]: -12,
    [AspiringStyleEnum.ECLECTIC_AND_CREATIVE]: -10,
    [AspiringStyleEnum.BOHO_AND_FREE_SPIRITED]: -3,

    // Color palettes
    [ColorPaletteEnum.NEUTRAL_EARTH_TONES]: 5,
    [ColorPaletteEnum.NEUTRALS_AND_EARTH_TONES]: 5,
    [ColorPaletteEnum.MONOCHROME]: 6,
    [ColorPaletteEnum.PASTELS]: 3,
    [ColorPaletteEnum.BOLD_AND_BRIGHT]: -10,
    [ColorPaletteEnum.DARK_AND_MOODY]: -4,
    [ColorPaletteEnum.WARM_TONES]: 2,
  };

  // ✅ baseline comfort before applying weights
  static BASE_COMFORT = 50;

  static normKey(label: any): string {
    return _.toLower(_.toString(label || ''))
      .replace(/&/g, 'and')
      .replace(/[^\w\s,]/g, '') // keep comma for splitting upstream
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\s/g, '_');
  }

  static toArray(value: any): string[] {
    if (_.isArray(value)) return _.map(_.compact(value), String);
    if (!value) return [];
    return _.chain(String(value)).split(',').map(_.trim).compact().value();
  }

  static clamp(n: number, min = 0, max = 100): number {
    return _.clamp(n, min, max);
  }

  static makeBalanceLabel(comfort: number): string {
    if (comfort === 50) return `Balanced (50%)`;
    return comfort > 50
      ? `Comfort-Leaning (${comfort}%)`
      : `Boldness-Leaning (${100 - comfort}%)`;
  }

  static calculate(profileMeta: any) {
    const labels = _.flatMap(
      [
        profileMeta?.current_style,
        profileMeta?.aspiring,
        profileMeta?.color_palettes,
      ],
      (v) => this.toArray(v),
    );

    const totalDelta = _.sumBy(
      labels,
      (label) => this.COMFORT_DELTA_MAP[this.normKey(label)] ?? 0,
    );

    const comfort = this.clamp(Math.round(this.BASE_COMFORT + totalDelta));
    const boldness = 100 - comfort;

    return {
      comfort_level: comfort,
      boldness_level: boldness,
      balance_level: this.makeBalanceLabel(comfort),
    };
  }
}
