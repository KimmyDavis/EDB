import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const GospelOfThePassionCard = ({ entries = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  if (!Array.isArray(entries) || !entries.length) return null;

  return (
    <section className="rounded-2xl border border-white/50 bg-[#fff6] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
            Gospel Of The Passion
          </h3>
          <Badge
            variant="outline"
            className="border-slate-300 bg-slate-100 text-slate-800"
          >
            {entries.length} {entries.length === 1 ? "reading" : "readings"}
          </Badge>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label="Toggle Gospel Of The Passion readings"
        >
          <ChevronDown
            className={`size-5 text-slate-600 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t pt-4">
          {entries.map((entry, idx) => (
            <div
              key={`passion-entry-${idx}`}
              onClick={() =>
                setSelectedEntry(selectedEntry === idx ? null : idx)
              }
              className={`cursor-pointer rounded-lg border p-3 sm:p-4 transition-colors ${
                selectedEntry === idx
                  ? "border-theme-gold/60 bg-theme-gold/15"
                  : "border-slate-200 bg-white/60 hover:border-slate-400 hover:bg-white/80"
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  setSelectedEntry(selectedEntry === idx ? null : idx);
                }
              }}
              aria-pressed={selectedEntry === idx}
            >
              <div className="mb-2 flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-slate-200 text-slate-900"
                >
                  {entry?.personality || "N"}
                </Badge>
                <span className="text-xs font-medium text-slate-600">
                  Part {idx + 1}
                </span>
              </div>
              <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                {entry?.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default GospelOfThePassionCard;
