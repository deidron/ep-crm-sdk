type PatternSegment =
  | { readonly kind: 'literal'; readonly text: string }
  | { readonly kind: 'run'; readonly letter: string; readonly length: number };

function scanPattern(pattern: string): PatternSegment[] {
  const segments: PatternSegment[] = [];
  let index: number = 0;
  while (index < pattern.length) {
    const character: string = pattern[index];
    if (character === "'") {
      const closing: number = pattern.indexOf("'", index + 1);
      const end: number = closing === -1 ? pattern.length : closing + 1;
      segments.push({ kind: 'literal', text: pattern.slice(index, end) });
      index = end;
      continue;
    }
    if (character === '\\') {
      const escaped: string | undefined = pattern[index + 1];
      segments.push({
        kind: 'literal',
        text: escaped === undefined ? '' : `'${escaped === "'" ? "''" : escaped}'`,
      });
      index += 2;
      continue;
    }
    if (!/[a-zA-Z]/.test(character)) {
      segments.push({ kind: 'literal', text: character });
      index += 1;
      continue;
    }
    let length: number = 1;
    while (pattern[index + length] === character) {
      length += 1;
    }
    segments.push({ kind: 'run', letter: character, length });
    index += length;
  }
  return segments;
}

function translateRun(letter: string, length: number): string {
  switch (letter) {
    // AM/PM designator: `t`/`tt` in .NET, `a` in CLDR.
    case 't':
      return 'a';
    // Day of the month is `d`/`dd` in both, but the day *name* is `ddd`/`dddd` in .NET
    // and `EEE`/`EEEE` in CLDR — where `dddd` would mean a four-digit day of the month.
    case 'd':
      return length <= 2 ? letter.repeat(length) : 'E'.repeat(length);
    // Fractional seconds: `f`/`F` in .NET, `S` in CLDR. CLDR has no "drop trailing
    // zeros" form, so `F` degrades to the padded one.
    case 'f':
    case 'F':
      return 'S'.repeat(Math.min(length, 3));
    // Offset from UTC: `K` and `z`/`zz`/`zzz` in .NET; in CLDR `Z` is `+0500` and
    // `ZZZZZ` is `+05:00`, which is what both `K` and `zzz` produce.
    case 'K':
      return 'ZZZZZ';
    case 'z':
      return length <= 2 ? 'Z' : 'ZZZZZ';
    // Era: `g`/`gg` in .NET, `G` in CLDR.
    case 'g':
      return 'G';
    // `y`, `M`, `H`, `h`, `m`, `s` carry the same meaning and the same lengths in both.
    default:
      return letter.repeat(length);
  }
}

export function toAngularDatePattern(pattern: string): string {
  return scanPattern(pattern)
    .map((segment) =>
      segment.kind === 'literal' ? segment.text : translateRun(segment.letter, segment.length),
    )
    .join('');
}

export function usesAmPmDesignator(pattern: string): boolean {
  return scanPattern(pattern).some((segment) => segment.kind === 'run' && segment.letter === 'a');
}
