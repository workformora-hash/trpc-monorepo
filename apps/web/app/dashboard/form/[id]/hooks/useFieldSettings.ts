import { useState, useCallback } from 'react';

export interface FieldValidation {
  // text
  minLength?: number;
  maxLength?: number;
  format?: string;
  pattern?: string;
  patternMessage?: string;
  // number
  min?: number;
  max?: number;
  integerOnly?: boolean;
  // rating
  maxStars?: number;
  // date
  minDate?: string;
  maxDate?: string;
  // choices
  randomize?: boolean;
  allowOther?: boolean;
  verticalAlign?: boolean;
  minChoices?: number;
  maxChoices?: number;
  // checkbox
  mustBeChecked?: boolean;
  // email
  blockFreeEmails?: boolean;
  allowedDomains?: string;
  // contact
  requirePhone?: boolean;
  requireCompany?: boolean;
  // address
  requireZip?: boolean;
  requireCountry?: boolean;
  // website
  requireSecure?: boolean;
  // dropdown
  alphabetical?: boolean;
  // ranking
  mustRankAll?: boolean;
  // screen
  buttonText?: string;
  redirectUrl?: string;
  // style overrides
  labelColor?: string;
  labelFontFamily?: string;
  labelFontSize?: string;
  descriptionColor?: string;
  descriptionFontFamily?: string;
  descriptionFontSize?: string;
  activeColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  // images
  imageUrl?: string;
  imageLayout?: string;
  imageFocalPoint?: string;
  imageBrightness?: number;
  imageAlt?: string;
  imageWidth?: string;
  imageHeight?: string;
  imageAspectRatio?: string;
  imageFilter?: string;
  bgImageUrl?: string;
  bgImageFocalPoint?: string;
  bgImageBrightness?: number;
  bgImageAlt?: string;
  bgImageFilter?: string;
  [key: string]: unknown;
}

export interface ActiveField {
  id: string;
  type: string;
  required: boolean;
  validation?: FieldValidation;
}

export interface MutationApi {
  mutate: (variables: {
    id: string;
    required?: boolean;
    type?: string;
    validation?: FieldValidation;
  }) => void;
}

/**
 * useFieldSettings — all sidebar state + handlers in one place.
 *
 * ### Why key={activeField.id} replaces useEffect sync:
 * When the parent renders <SettingsSidebar key={activeField.id} />, React unmounts
 * and remounts the component, resetting all useState to the new field's values.
 * This eliminates the 35-line useEffect and the fragile dependency array.
 */
export function useFieldSettings(activeField: ActiveField, mutation: MutationApi) {
  const v = (activeField.validation ?? {}) as FieldValidation;
  const id = activeField.id;

  // All local state initialized from current field (reset via key prop, not useEffect)
  const [localRequired, setLocalRequired] = useState(activeField.required);
  const [localIsMultiple, setLocalIsMultiple] = useState(activeField.type === 'multi_select');
  const [localRandomize, setLocalRandomize] = useState(!!v.randomize);
  const [localAllowOther, setLocalAllowOther] = useState(!!v.allowOther);
  const [localVerticalAlign, setLocalVerticalAlign] = useState(!!v.verticalAlign);
  const [localMinLength, setLocalMinLength] = useState<number | ''>(v.minLength ?? '');
  const [localMaxLength, setLocalMaxLength] = useState<number | ''>(v.maxLength ?? '');
  const [localMin, setLocalMin] = useState<number | ''>(v.min ?? '');
  const [localMax, setLocalMax] = useState<number | ''>(v.max ?? '');
  const [localMinDate, setLocalMinDate] = useState(v.minDate ?? '');
  const [localMaxDate, setLocalMaxDate] = useState(v.maxDate ?? '');
  const [localBlockFreeEmails, setLocalBlockFreeEmails] = useState(!!v.blockFreeEmails);
  const [localAllowedDomains, setLocalAllowedDomains] = useState(v.allowedDomains ?? '');
  const [localFormat, setLocalFormat] = useState(v.format ?? 'any');
  const [localPattern, setLocalPattern] = useState(v.pattern ?? '');
  const [localPatternMessage, setLocalPatternMessage] = useState(v.patternMessage ?? '');
  const [localIntegerOnly, setLocalIntegerOnly] = useState(!!v.integerOnly);
  const [localMaxStars, setLocalMaxStars] = useState<number>(v.maxStars ?? v.max ?? 5);
  const [localMustBeChecked, setLocalMustBeChecked] = useState(!!v.mustBeChecked);
  const [localMinChoices, setLocalMinChoices] = useState<number | ''>(v.minChoices ?? '');
  const [localMaxChoices, setLocalMaxChoices] = useState<number | ''>(v.maxChoices ?? '');
  const [localRequirePhone, setLocalRequirePhone] = useState(!!v.requirePhone);
  const [localRequireCompany, setLocalRequireCompany] = useState(!!v.requireCompany);
  const [localRequireZip, setLocalRequireZip] = useState(!!v.requireZip);
  const [localRequireCountry, setLocalRequireCountry] = useState(!!v.requireCountry);
  const [localRequireSecure, setLocalRequireSecure] = useState(!!v.requireSecure);
  const [localAlphabetical, setLocalAlphabetical] = useState(!!v.alphabetical);
  const [localMustRankAll, setLocalMustRankAll] = useState(!!v.mustRankAll);
  const [localButtonText, setLocalButtonText] = useState(v.buttonText ?? '');
  const [localRedirectUrl, setLocalRedirectUrl] = useState(v.redirectUrl ?? '');

  // ── Generic helpers ────────────────────────────────────────────────────────

  /** Patch a single key in validation and persist */
  const patchValidation = useCallback(
    (patch: Partial<FieldValidation>) => {
      mutation.mutate({ id, validation: { ...v, ...patch } });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, JSON.stringify(v)],
  );

  /** Generic optimistic toggle for a boolean validation key */
  const makeValidationToggle = <K extends keyof FieldValidation>(
    key: K,
    localValue: boolean,
    setter: (v: boolean) => void,
  ) =>
    useCallback(() => {
      const next = !localValue;
      setter(next);
      patchValidation({ [key]: next } as Partial<FieldValidation>);
    }, [localValue]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleToggleRequired = useCallback(() => {
    const next = !localRequired;
    setLocalRequired(next);
    mutation.mutate({ id, required: next });
  }, [localRequired, id, mutation]);

  const handleToggleMultiple = useCallback(() => {
    const next = !localIsMultiple;
    setLocalIsMultiple(next);
    mutation.mutate({ id, type: next ? 'multi_select' : 'single_select' });
  }, [localIsMultiple, id, mutation]);

  const handleToggleRandomize = useCallback(() => {
    const next = !localRandomize;
    setLocalRandomize(next);
    patchValidation({ randomize: next });
  }, [localRandomize, patchValidation]);

  const handleToggleAllowOther = useCallback(() => {
    const next = !localAllowOther;
    setLocalAllowOther(next);
    patchValidation({ allowOther: next });
  }, [localAllowOther, patchValidation]);

  const handleToggleVerticalAlign = useCallback(() => {
    const next = !localVerticalAlign;
    setLocalVerticalAlign(next);
    patchValidation({ verticalAlign: next });
  }, [localVerticalAlign, patchValidation]);

  const handleMinLengthBlur = useCallback(
    (val: string) => patchValidation({ minLength: val === '' ? undefined : parseInt(val, 10) }),
    [patchValidation],
  );

  const handleMaxLengthBlur = useCallback(
    (val: string) => patchValidation({ maxLength: val === '' ? undefined : parseInt(val, 10) }),
    [patchValidation],
  );

  const handleMinBlur = useCallback(
    (val: string) => patchValidation({ min: val === '' ? undefined : parseFloat(val) }),
    [patchValidation],
  );

  const handleMaxBlur = useCallback(
    (val: string) => patchValidation({ max: val === '' ? undefined : parseFloat(val) }),
    [patchValidation],
  );

  const handleMinDateBlur = useCallback(
    (val: string) => patchValidation({ minDate: val || undefined }),
    [patchValidation],
  );

  const handleMaxDateBlur = useCallback(
    (val: string) => patchValidation({ maxDate: val || undefined }),
    [patchValidation],
  );

  const handleToggleBlockFreeEmails = useCallback(() => {
    const next = !localBlockFreeEmails;
    setLocalBlockFreeEmails(next);
    patchValidation({ blockFreeEmails: next });
  }, [localBlockFreeEmails, patchValidation]);

  const handleAllowedDomainsBlur = useCallback(
    (val: string) => patchValidation({ allowedDomains: val.trim() || undefined }),
    [patchValidation],
  );

  const handleFormatChange = useCallback(
    (val: string) => {
      setLocalFormat(val);
      patchValidation({ format: val === 'any' ? undefined : val });
    },
    [patchValidation],
  );

  const handlePatternBlur = useCallback(
    (val: string) => patchValidation({ pattern: val.trim() || undefined }),
    [patchValidation],
  );

  const handlePatternMessageBlur = useCallback(
    (val: string) => patchValidation({ patternMessage: val.trim() || undefined }),
    [patchValidation],
  );

  const handleToggleIntegerOnly = useCallback(() => {
    const next = !localIntegerOnly;
    setLocalIntegerOnly(next);
    patchValidation({ integerOnly: next });
  }, [localIntegerOnly, patchValidation]);

  const handleMaxStarsChange = useCallback(
    (val: number) => {
      setLocalMaxStars(val);
      patchValidation({ maxStars: val, max: val });
    },
    [patchValidation],
  );

  const handleToggleMustBeChecked = useCallback(() => {
    const next = !localMustBeChecked;
    setLocalMustBeChecked(next);
    patchValidation({ mustBeChecked: next });
  }, [localMustBeChecked, patchValidation]);

  const handleMinChoicesBlur = useCallback(
    (val: string) => patchValidation({ minChoices: val === '' ? undefined : parseInt(val, 10) }),
    [patchValidation],
  );

  const handleMaxChoicesBlur = useCallback(
    (val: string) => patchValidation({ maxChoices: val === '' ? undefined : parseInt(val, 10) }),
    [patchValidation],
  );

  const handleToggleRequirePhone = useCallback(() => {
    const next = !localRequirePhone;
    setLocalRequirePhone(next);
    patchValidation({ requirePhone: next });
  }, [localRequirePhone, patchValidation]);

  const handleToggleRequireCompany = useCallback(() => {
    const next = !localRequireCompany;
    setLocalRequireCompany(next);
    patchValidation({ requireCompany: next });
  }, [localRequireCompany, patchValidation]);

  const handleToggleRequireZip = useCallback(() => {
    const next = !localRequireZip;
    setLocalRequireZip(next);
    patchValidation({ requireZip: next });
  }, [localRequireZip, patchValidation]);

  const handleToggleRequireCountry = useCallback(() => {
    const next = !localRequireCountry;
    setLocalRequireCountry(next);
    patchValidation({ requireCountry: next });
  }, [localRequireCountry, patchValidation]);

  const handleToggleRequireSecure = useCallback(() => {
    const next = !localRequireSecure;
    setLocalRequireSecure(next);
    patchValidation({ requireSecure: next });
  }, [localRequireSecure, patchValidation]);

  const handleToggleAlphabetical = useCallback(() => {
    const next = !localAlphabetical;
    setLocalAlphabetical(next);
    patchValidation({ alphabetical: next });
  }, [localAlphabetical, patchValidation]);

  const handleToggleMustRankAll = useCallback(() => {
    const next = !localMustRankAll;
    setLocalMustRankAll(next);
    patchValidation({ mustRankAll: next });
  }, [localMustRankAll, patchValidation]);

  return {
    // raw validation (for things that don't need local state)
    activeValidation: v,
    patchValidation,
    // local state
    localRequired, localIsMultiple, localRandomize, localAllowOther, localVerticalAlign,
    localMinLength, setLocalMinLength,
    localMaxLength, setLocalMaxLength,
    localMin, setLocalMin,
    localMax, setLocalMax,
    localMinDate, setLocalMinDate,
    localMaxDate, setLocalMaxDate,
    localBlockFreeEmails,
    localAllowedDomains, setLocalAllowedDomains,
    localFormat,
    localPattern, setLocalPattern,
    localPatternMessage, setLocalPatternMessage,
    localIntegerOnly,
    localMaxStars,
    localMustBeChecked,
    localMinChoices, setLocalMinChoices,
    localMaxChoices, setLocalMaxChoices,
    localRequirePhone, localRequireCompany,
    localRequireZip, localRequireCountry,
    localRequireSecure, localAlphabetical, localMustRankAll,
    localButtonText, setLocalButtonText,
    localRedirectUrl, setLocalRedirectUrl,
    // handlers
    handleToggleRequired,
    handleToggleMultiple,
    handleToggleRandomize,
    handleToggleAllowOther,
    handleToggleVerticalAlign,
    handleMinLengthBlur, handleMaxLengthBlur,
    handleMinBlur, handleMaxBlur,
    handleMinDateBlur, handleMaxDateBlur,
    handleToggleBlockFreeEmails,
    handleAllowedDomainsBlur,
    handleFormatChange,
    handlePatternBlur, handlePatternMessageBlur,
    handleToggleIntegerOnly,
    handleMaxStarsChange,
    handleToggleMustBeChecked,
    handleMinChoicesBlur, handleMaxChoicesBlur,
    handleToggleRequirePhone, handleToggleRequireCompany,
    handleToggleRequireZip, handleToggleRequireCountry,
    handleToggleRequireSecure,
    handleToggleAlphabetical,
    handleToggleMustRankAll,
  };
}
