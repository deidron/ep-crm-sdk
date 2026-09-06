/**
 * The platform reports date and time patterns of its culture in the .NET syntax
 * (`CultureInfo.DateTimeFormat`), while `formatDate` from `@angular/common` reads the CLDR
 * one. The two overlap enough to look interchangeable — `M/d/yyyy` and `HH:mm` mean the
 * same in both — and then differ on the tokens that matter: .NET writes the AM/PM
 * designator as `tt`, which CLDR does not know at all and passes through as literal text.
 * Hence en-US arriving from the platform as `h:mm tt` and rendering as "8:02 tt".
 */

/** A run of one repeated pattern letter, translated to its CLDR counterpart. */
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

/**
 * Translates a .NET date/time pattern into the one `formatDate` from `@angular/common`
 * understands. Text inside single quotes is a literal in both syntaxes and is copied as
 * is; a backslash escape, which CLDR has no notion of, becomes a quoted literal.
 */
export function toAngularDatePattern(pattern: string): string {
  let result: string = '';
  let index: number = 0;
  while (index < pattern.length) {
    const character: string = pattern[index];
    if (character === "'") {
      const closing: number = pattern.indexOf("'", index + 1);
      const end: number = closing === -1 ? pattern.length : closing + 1;
      result += pattern.slice(index, end);
      index = end;
      continue;
    }
    if (character === '\\') {
      const escaped: string | undefined = pattern[index + 1];
      result += escaped === undefined ? '' : `'${escaped === "'" ? "''" : escaped}'`;
      index += 2;
      continue;
    }
    if (!/[a-zA-Z]/.test(character)) {
      result += character;
      index += 1;
      continue;
    }
    let length: number = 1;
    while (pattern[index + length] === character) {
      length += 1;
    }
    result += translateRun(character, length);
    index += length;
  }
  return result;
}
