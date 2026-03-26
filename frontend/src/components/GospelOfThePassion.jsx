"use client";

import React from "react";
import { ArrowDown, ArrowUp, Plus, ScrollText, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const PERSONALITY_OPTIONS = [
  { value: "N", label: "N" },
  { value: "J", label: "J" },
  { value: "O", label: "O" },
  { value: "C", label: "C" },
];

const createPassionItem = () => ({ personality: "N", body: "" });

const GospelOfThePassion = ({ list, setList, open, onOpenChange }) => {
  const safeList = Array.isArray(list) ? list : [];

  const handleAddItem = () => {
    setList([...safeList, createPassionItem()]);
  };

  const handleUpdateItem = (index, key, value) => {
    setList(
      safeList.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  };

  const handleDeleteItem = (index) => {
    setList(safeList.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleMoveItem = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= safeList.length) return;

    const nextList = [...safeList];
    [nextList[index], nextList[nextIndex]] = [
      nextList[nextIndex],
      nextList[index],
    ];
    setList(nextList);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100%-1rem)] max-w-none flex-col overflow-hidden bg-[#fffaf2] p-0 sm:max-w-4xl lg:max-w-5xl supports-backdrop-filter:backdrop-blur-sm">
        <DialogHeader className="border-b bg-theme-gold/15 px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <ScrollText className="size-5" />
            Gospel Of The Passion
          </DialogTitle>
          <DialogDescription className="text-slate-700">
            Add the parts to be proclaimed, reorder them, and remove any that
            are no longer needed.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-theme-gold/30 bg-white/70 px-4 py-3">
            <div>
              <p className="font-medium text-slate-900">Passion Entries</p>
              <p className="text-sm text-slate-700">
                Each item needs a personality and the text body to read.
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-theme-gold/40 bg-theme-gold/10 text-slate-800"
            >
              {safeList.length} {safeList.length === 1 ? "item" : "items"}
            </Badge>
          </div>

          {safeList.length === 0 ? (
            <Card className="border-dashed border-theme-gold/40 bg-white/70 shadow-none">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <ScrollText className="size-8 text-slate-500" />
                <div className="space-y-1">
                  <p className="font-medium text-slate-900">
                    No Passion entries yet
                  </p>
                  <p className="text-sm text-slate-600">
                    Start by adding the first proclamation block.
                  </p>
                </div>
                <Button onClick={handleAddItem} className="mt-2">
                  <Plus className="size-4" />
                  Add entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            safeList.map((item, index) => (
              <Card
                key={`gospel-passion-${index}`}
                className="bg-white/80 shadow-sm"
              >
                <CardHeader className="border-b pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-slate-900">
                        Entry {index + 1}
                      </CardTitle>
                      <CardDescription className="text-slate-600">
                        Define the speaking personality and body text for this
                        section.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => handleMoveItem(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move entry ${index + 1} up`}
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => handleMoveItem(index, 1)}
                        disabled={index === safeList.length - 1}
                        aria-label={`Move entry ${index + 1} down`}
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => handleDeleteItem(index)}
                        aria-label={`Delete entry ${index + 1}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 pt-4 md:grid-cols-[180px_1fr]">
                  <Field>
                    <FieldLabel htmlFor={`passion-personality-${index}`}>
                      Personality
                    </FieldLabel>
                    <FieldDescription>
                      Choose one of the supported personalities.
                    </FieldDescription>
                    <Select
                      value={item?.personality || "N"}
                      onValueChange={(value) =>
                        handleUpdateItem(index, "personality", value)
                      }
                    >
                      <SelectTrigger
                        id={`passion-personality-${index}`}
                        className="w-full bg-white"
                      >
                        <SelectValue placeholder="Choose personality" />
                      </SelectTrigger>
                      <SelectContent>
                        {PERSONALITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor={`passion-body-${index}`}>
                      Body
                    </FieldLabel>
                    <FieldDescription>
                      Enter the text that belongs to this part of the reading.
                    </FieldDescription>
                    <Textarea
                      id={`passion-body-${index}`}
                      value={item?.body || ""}
                      onChange={(event) =>
                        handleUpdateItem(index, "body", event.target.value)
                      }
                      placeholder="Write the proclamation text here..."
                      className="min-h-32 resize-y bg-white"
                    />
                  </Field>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 justify-between gap-2 border-t border-theme-gold/20 bg-theme-gold/10 px-4 py-4 sm:justify-between sm:px-6">
          <Button type="button" variant="outline" onClick={handleAddItem}>
            <Plus className="size-4" />
            Add entry
          </Button>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GospelOfThePassion;
