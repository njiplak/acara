import * as React from 'react';
import { Input } from '@/components/ui/input';

// Pattern tokens
const TOKEN_DIGIT = '#';
const TOKEN_LETTER = 'A';
const TOKEN_ANY = '*';

// Pre-compiled regexes
const RE_DIGIT = /\d/;
const RE_LETTER = /[a-zA-Z]/;
const RE_ALPHANUM = /[\da-zA-Z]/;

function isToken(char: string): boolean {
    return char === TOKEN_DIGIT || char === TOKEN_LETTER || char === TOKEN_ANY;
}

function matchesToken(char: string, token: string): boolean {
    if (token === TOKEN_DIGIT) return RE_DIGIT.test(char);
    if (token === TOKEN_LETTER) return RE_LETTER.test(char);
    if (token === TOKEN_ANY) return true;
    return false;
}

// --- Pattern mode helpers ---

function applyPattern(raw: string, pattern: string): string {
    const parts: string[] = [];
    let rawIndex = 0;

    for (let i = 0; i < pattern.length && rawIndex < raw.length; i++) {
        const patternChar = pattern[i];
        if (isToken(patternChar)) {
            if (matchesToken(raw[rawIndex], patternChar)) {
                parts.push(raw[rawIndex]);
                rawIndex++;
            } else {
                rawIndex++;
                i--;
            }
        } else {
            parts.push(patternChar);
        }
    }

    return parts.join('');
}

function stripPattern(formatted: string, pattern: string): string {
    const parts: string[] = [];
    const len = Math.min(formatted.length, pattern.length);
    for (let i = 0; i < len; i++) {
        if (isToken(pattern[i])) {
            parts.push(formatted[i]);
        }
    }
    return parts.join('');
}

function getPatternCursorPosition(rawCursorPos: number, pattern: string): number {
    let rawCount = 0;
    for (let i = 0; i < pattern.length; i++) {
        if (rawCount === rawCursorPos) return i;
        if (isToken(pattern[i])) {
            rawCount++;
        }
    }
    return pattern.length;
}

function getRawCursorPosition(formattedCursorPos: number, pattern: string): number {
    let rawCount = 0;
    const len = Math.min(formattedCursorPos, pattern.length);
    for (let i = 0; i < len; i++) {
        if (isToken(pattern[i])) {
            rawCount++;
        }
    }
    return rawCount;
}

// --- Format/Parse mode presets ---

type Preset = {
    format: (value: string) => string;
    parse: (display: string) => string;
};

const RE_THOUSAND = /\B(?=(\d{3})+(?!\d))/g;

function createCurrencyPreset(
    separator: string = ',',
    decimal: string = '.',
    decimals: number = 0,
): Preset {
    const stripRegex = new RegExp(`[^\\d${decimal === '.' ? '\\.' : decimal}]`, 'g');

    return {
        format(value: string): string {
            if (!value) return '';
            const parts = value.split('.');
            const intPart = parts[0].replace(RE_THOUSAND, separator);
            if (decimals > 0 && parts[1] !== undefined) {
                return intPart + decimal + parts[1].slice(0, decimals);
            }
            return intPart;
        },
        parse(display: string): string {
            const cleaned = display.replace(stripRegex, '');
            if (decimal !== '.') {
                return cleaned.replace(decimal, '.');
            }
            return cleaned;
        },
    };
}

const RE_NON_DIGIT_DOT = /[^\d.]/g;

function createPercentagePreset(): Preset {
    return {
        format(value: string): string {
            if (!value) return '';
            return value;
        },
        parse(display: string): string {
            const cleaned = display.replace(RE_NON_DIGIT_DOT, '');
            const num = parseFloat(cleaned);
            if (isNaN(num)) return '';
            if (num > 100) return '100';
            if (num < 0) return '0';
            return String(num);
        },
    };
}

const PRESETS: Record<string, Preset> = {
    currency: createCurrencyPreset(),
    percentage: createPercentagePreset(),
};

const PRESET_KEYS = new Set(Object.keys(PRESETS));

// --- Component ---

type PatternMaskProps = {
    mask: string;
    format?: never;
    parse?: never;
    prefix?: never;
    suffix?: never;
};

type FormatParseMaskProps = {
    mask?: never;
    format: (value: string) => string;
    parse: (display: string) => string;
    prefix?: string;
    suffix?: string;
};

type PresetMaskProps = {
    mask: 'currency' | 'percentage';
    format?: never;
    parse?: never;
    prefix?: string;
    suffix?: string;
};

type MaskConfig = PatternMaskProps | FormatParseMaskProps | PresetMaskProps;

type MaskedInputProps = Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> &
    MaskConfig & {
        value?: string | number;
        onChange?: (rawValue: string) => void;
    };

const IDENTITY_PRESET: Preset = { format: (v: string) => v, parse: (v: string) => v };

function MaskedInput({
    mask,
    format: formatFn,
    parse: parseFn,
    prefix = '',
    suffix = '',
    value,
    onChange,
    ...inputProps
}: MaskedInputProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const cursorRef = React.useRef<number>(0);

    const isPatternMode = React.useMemo(
        () => !!mask && /[#A*]/.test(mask) && !PRESET_KEYS.has(mask),
        [mask],
    );

    // Use refs for callback props to avoid re-creating memos/callbacks
    const formatRef = React.useRef(formatFn);
    const parseRef = React.useRef(parseFn);
    const onChangeRef = React.useRef(onChange);
    formatRef.current = formatFn;
    parseRef.current = parseFn;
    onChangeRef.current = onChange;

    // Resolve format/parse — only depends on mask (preset key), not on inline fn refs
    const { format, parse } = React.useMemo(() => {
        if (mask && mask in PRESETS) {
            return PRESETS[mask];
        }
        if (!mask) {
            // format/parse mode — wrap refs so the returned object is stable
            return {
                format: (v: string) => (formatRef.current ?? IDENTITY_PRESET.format)(v),
                parse: (v: string) => (parseRef.current ?? IDENTITY_PRESET.parse)(v),
            };
        }
        // pattern mode
        return IDENTITY_PRESET;
    }, [mask]);

    // Pre-compile prefix/suffix regexes
    const prefixRegex = React.useMemo(
        () => (prefix ? new RegExp(`^${escapeRegExp(prefix)}`) : null),
        [prefix],
    );
    const suffixRegex = React.useMemo(
        () => (suffix ? new RegExp(`${escapeRegExp(suffix)}$`) : null),
        [suffix],
    );

    // Compute display value
    const displayValue = React.useMemo(() => {
        const raw = String(value ?? '');
        if (isPatternMode) {
            return applyPattern(raw, mask!);
        }
        const formatted = format(raw);
        if (!formatted) return '';
        return prefix + formatted + suffix;
    }, [value, isPatternMode, mask, format, prefix, suffix]);

    // Restore cursor after render
    React.useLayoutEffect(() => {
        const el = inputRef.current;
        if (el && document.activeElement === el) {
            const pos = Math.min(cursorRef.current, displayValue.length);
            el.setSelectionRange(pos, pos);
        }
    }, [displayValue]);

    const handleChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const el = e.target;
            const inputValue = el.value;
            const selectionStart = el.selectionStart ?? 0;

            if (isPatternMode) {
                const rawInput: string[] = [];
                for (let i = 0; i < inputValue.length; i++) {
                    if (RE_ALPHANUM.test(inputValue[i])) {
                        rawInput.push(inputValue[i]);
                    }
                }

                let filteredRaw = '';
                let patternIdx = 0;
                let rawIdx = 0;
                while (rawIdx < rawInput.length && patternIdx < mask!.length) {
                    const token = mask![patternIdx];
                    if (isToken(token)) {
                        if (matchesToken(rawInput[rawIdx], token)) {
                            filteredRaw += rawInput[rawIdx];
                            rawIdx++;
                            patternIdx++;
                        } else {
                            rawIdx++;
                        }
                    } else {
                        patternIdx++;
                    }
                }

                const rawCursorPos = getRawCursorPosition(selectionStart, mask!);
                const clampedRawCursor = Math.min(rawCursorPos, filteredRaw.length);
                cursorRef.current = getPatternCursorPosition(clampedRawCursor, mask!);

                onChangeRef.current?.(filteredRaw);
            } else {
                let withoutAffixes = inputValue;
                if (prefixRegex) withoutAffixes = withoutAffixes.replace(prefixRegex, '');
                if (suffixRegex) withoutAffixes = withoutAffixes.replace(suffixRegex, '');

                const rawValue = parse(withoutAffixes);
                const newFormatted = rawValue ? prefix + format(rawValue) + suffix : '';

                const lengthDiff = newFormatted.length - inputValue.length;
                cursorRef.current = Math.max(0, selectionStart + lengthDiff);

                onChangeRef.current?.(rawValue);
            }
        },
        [isPatternMode, mask, format, parse, prefix, suffix, prefixRegex, suffixRegex],
    );

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!isPatternMode) return;
            const el = e.currentTarget;
            const pos = el.selectionStart ?? 0;

            if (e.key === 'Backspace' && pos > 0) {
                let targetPos = pos - 1;
                while (targetPos > 0 && !isToken(mask![targetPos])) {
                    targetPos--;
                }
                if (targetPos !== pos - 1) {
                    e.preventDefault();
                    const raw = stripPattern(displayValue, mask!);
                    const rawCursor = getRawCursorPosition(targetPos, mask!);
                    const newRaw = raw.slice(0, rawCursor) + raw.slice(rawCursor + 1);
                    cursorRef.current = getPatternCursorPosition(rawCursor, mask!);
                    onChangeRef.current?.(newRaw);
                }
            }
        },
        [isPatternMode, mask, displayValue],
    );

    return (
        <Input
            {...inputProps}
            ref={inputRef}
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
        />
    );
}

function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export { MaskedInput, createCurrencyPreset, createPercentagePreset };
export type { MaskedInputProps };
