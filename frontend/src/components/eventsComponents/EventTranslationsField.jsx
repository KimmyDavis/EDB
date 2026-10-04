"use client";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  TRANSLATION_LANGUAGES,
  createDefaultTranslations,
  normalizeLanguage,
} from "@/lib/eventDescription";

const languageLabel = (value) =>
  TRANSLATION_LANGUAGES.find((lang) => lang.value === value)?.label || value;

export default function EventTranslationsField({ value = [], onChange }) {
  const translations = Array.isArray(value) ? value : [];

  const updateEntry = (index, field, nextValue) => {
    onChange(
      translations.map((entry, i) =>
        i === index ? { ...entry, [field]: nextValue } : entry,
      ),
    );
  };

  const removeEntry = (index) => {
    onChange(translations.filter((_, i) => i !== index));
  };

  const addEntry = () => {
    // pick the first language not yet used (excluding english)
    const used = new Set(
      translations.map((entry) => normalizeLanguage(entry.language)),
    );
    const next =
      TRANSLATION_LANGUAGES.find(
        (lang) => lang.value !== "english" && !used.has(lang.value),
      )?.value || "french";
    onChange([...translations, { language: next, body: "" }]);
  };

  return (
    <div className="space-y-3">
      {translations.length === 0 && (
        <p className="text-xs text-slate-500">
          No translations yet. The English description above is the default.
        </p>
      )}

      {translations.map((entry, index) => (
        <div
          key={index}
          className="space-y-2 rounded-lg border border-slate-200 bg-white/50 p-3"
        >
          <div className="flex items-center gap-2">
            <select
              value={normalizeLanguage(entry.language)}
              onChange={(e) => updateEntry(index, "language", e.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-800 shadow-xs"
            >
              {TRANSLATION_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-500">
              {languageLabel(entry.language)}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeEntry(index)}
              className="ml-auto flex items-center gap-1 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
          <Textarea
            value={entry.body || ""}
            onChange={(e) => updateEntry(index, "body", e.target.value)}
            placeholder={`Description in ${languageLabel(entry.language)}`}
            rows="3"
            className="text-sm shadow-xs text-slate-800 font-normal"
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addEntry}
        className="flex items-center gap-1"
      >
        <Plus className="h-4 w-4" />
        Add translation
      </Button>
    </div>
  );
}
