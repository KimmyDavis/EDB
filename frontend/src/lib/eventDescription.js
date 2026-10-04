export const TRANSLATION_LANGUAGES = [
  { value: "english", label: "English" },
  { value: "french", label: "French" },
  { value: "portuguese", label: "Portuguese" },
];

export const DEFAULT_TRANSLATION_LANGUAGES = ["french", "portuguese"];

export const normalizeLanguage = (language) =>
  String(language || "")
    .trim()
    .toLowerCase();

/*
getDisplayDescription
receives: an event and the viewer's preferred language.
returns: the matching translation body when present and non-empty,
         otherwise the original (English) description.
*/
export const getDisplayDescription = (event, userLanguage = "english") => {
  if (!event) return "";
  const language = normalizeLanguage(userLanguage);
  const match = event.translations?.find(
    (entry) => normalizeLanguage(entry?.language) === language,
  );
  if (match?.body && match.body.trim()) return match.body;
  return event.description || "";
};

export const createDefaultTranslations = () =>
  DEFAULT_TRANSLATION_LANGUAGES.map((language) => ({ language, body: "" }));
