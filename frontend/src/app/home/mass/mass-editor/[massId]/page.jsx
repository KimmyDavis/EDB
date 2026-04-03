"use client";
import React, { use, useEffect, useState } from "react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { useSelector } from "react-redux";
import { selectAllSongs } from "@/features/songs/songsApiSlice";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  useCreateMassMutation,
  useEditMassMutation,
  useQueryMassQuery,
} from "@/features/mass/massApiSlice";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import GospelOfThePassion from "@/components/GospelOfThePassion";

const starterMassTemplate = {
  acclamation: {
    recited: false,
  },
  creed: {
    included: true,
    recited: false,
  },
  LordsPrayer: {
    recited: true,
  },
  thanksgiving: {
    included: true,
  },
  gloria: {
    included: true,
  },
  gospelOfThePassion: [],
};

const songFields = [
  "entrance",
  "kyrie",
  "gloria",
  "acclamation",
  "creed",
  "petition",
  "LordsPrayer",
  "offertory",
  "sanctus",
  "peace",
  "agnusDei",
  "holyCommunion",
  "thanksgiving",
  "exit",
];

const NO_SONG_VALUE = "__none__";

const normalizeSelectedSongId = (songId) =>
  songId === NO_SONG_VALUE ? "" : songId;

const normalizeSongRef = (value) => {
  if (!value || typeof value !== "object") return value;
  const normalizedSongId =
    typeof value.songId === "string"
      ? value.songId
      : value.songId?._id || value.songId?.id || "";
  return { ...value, songId: normalizedSongId };
};

const normalizePassionEntry = (entry) => ({
  personality: ["N", "J", "O", "C"].includes(entry?.personality)
    ? entry.personality
    : "N",
  body: typeof entry?.body === "string" ? entry.body : "",
});

const normalizeMassForForm = (rawMass = {}) => {
  const passionEntriesSource =
    rawMass?.gospelOfThePassion || rawMass?.readings || [];

  const normalizedMass = {
    ...starterMassTemplate,
    ...rawMass,
    gospelOfThePassion: Array.isArray(passionEntriesSource)
      ? passionEntriesSource.map(normalizePassionEntry)
      : [],
    thanksgiving: rawMass?.thanksgiving ||
      rawMass?.thanksGiving || {
        ...(starterMassTemplate.thanksgiving || {}),
      },
  };

  songFields.forEach((field) => {
    if (normalizedMass[field]) {
      normalizedMass[field] = normalizeSongRef(normalizedMass[field]);
    }
  });

  delete normalizedMass.thanksGiving;
  return normalizedMass;
};

const MassEditor = ({ params }) => {
  // hooks
  const router = useRouter();
  const { massId } = use(params);
  const { data: songsData, isLoading, isError } = useSelector(selectAllSongs);
  const songs = songsData?.songs || [];
  const getSongTitleById = (songId) => {
    if (!songId) return "";
    return songs.find((song) => song._id === songId)?.title || "Selected song";
  };

  const renderSongSelectValue = (songId, placeholder) => (
    <SelectValue placeholder={placeholder}>
      {songId ? getSongTitleById(songId) : undefined}
    </SelectValue>
  );

  const {
    data: massToEdit,
    isLoading: massToEditLoading,
    isError: massToEditIsError,
    error: massToeditError,
  } = useQueryMassQuery({ id: massId }, { skip: massId === "new" });
  // console.log(
  //   massToEdit,
  //   massToEditLoading,
  //   massToEditIsError,
  //   massToeditError
  // );
  const [
    createMass,
    {
      isLoading: isCreating,
      isError: isCreateError,
      isSuccess: isCreateSuccess,
      error: createError,
    },
  ] = useCreateMassMutation();
  const [
    editMass,
    {
      isLoading: isSubmittingEdit,
      isError: isEditError,
      isSuccess: isEditSuccess,
      error: editError,
    },
  ] = useEditMassMutation();

  // state
  const isEditingMass = massId !== "new";
  const [mass, setMass] = useState(starterMassTemplate);
  const [canSave, setCanSave] = useState(false);
  const [gospelPassionOpen, setGospelPassionOpen] = useState(false);

  // handlers
  const handleUpdateMass = (field, value) => {
    let tmpMass = { ...mass };
    tmpMass[field] = value;
    setMass({ ...tmpMass });
  };
  const handleSubmit = async () => {
    const normalizedPassionEntries = Array.isArray(mass?.gospelOfThePassion)
      ? mass.gospelOfThePassion.map(normalizePassionEntry)
      : [];
    const payload = {
      ...mass,
      gospelOfThePassion: normalizedPassionEntries,
    };

    if (isEditingMass) {
      await editMass({ ...payload, id: massId });
    } else {
      await createMass(payload);
    }
  };

  // effects
  useEffect(() => {
    setCanSave(Boolean(mass.title && mass.date));
  }, [mass]);

  useEffect(() => {
    if (massToEdit && !massToEditIsError) {
      setMass(normalizeMassForForm(massToEdit?.mass?.[0] || {}));
    }
  }, [massToEdit, massToEditIsError]);

  useEffect(() => {
    if (isEditSuccess || isCreateSuccess) {
      toast.success("Mass successfully submitted! 🥳", {
        position: "top-center",
      });
      setMass(starterMassTemplate);
      router.push("/home/mass");
    }
  }, [isCreateSuccess, isEditSuccess]);
  useEffect(() => {
    if (isCreateError || isEditError) {
      toast.error("Failed to submit 😔", { position: "top-center" });
      setMass(starterMassTemplate);
      router.push("/home/mass");
    }
  }, [isCreateError, isEditError]);

  const renderStatusState = (title, description, isErrorState = false) => (
    <div className="relative bg-theme-gold/90 min-h-screen p-6">
      <Image
        src="/images/backgrounds/grid-noise.png"
        width={1000}
        height={1000}
        alt="square fabric image background"
        className="fixed top-0 left-0 w-full h-screen object-cover z-0"
      />
      <div className="relative z-10 max-w-3xl mx-auto">
        <Card
          className={`shadow-lg ${isErrorState ? "bg-red-50/95 border-red-200" : "bg-[#fff5]"}`}
        >
          <CardContent className="py-10 text-center">
            <h2
              className={`text-xl font-semibold mb-2 ${isErrorState ? "text-red-900" : "text-slate-900"}`}
            >
              {title}
            </h2>
            <p
              className={`${isErrorState ? "text-red-800" : "text-slate-700"}`}
            >
              {description}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (isLoading) {
    return renderStatusState(
      "Loading songs",
      "Preparing the song library for the mass editor...",
    );
  }
  if (isError) {
    return renderStatusState(
      "Could not load songs",
      "The song library failed to load. Please refresh and try again.",
      true,
    );
  }
  if (!songs?.length) {
    return renderStatusState(
      "No songs available",
      "Add songs first, then return here to build a mass lineup.",
    );
  }

  if (massToEditLoading) {
    return renderStatusState(
      "Loading mass details",
      "Fetching the mass information for editing...",
    );
  }
  if (massToEditIsError) {
    return renderStatusState(
      "Could not load this mass",
      massToeditError?.data?.message ||
        "An error occurred while loading this mass.",
      true,
    );
  }

  return (
    <div className="relative bg-theme-gold/90 min-h-screen p-6">
      <Image
        src="/images/backgrounds/grid-noise.png"
        width={1000}
        height={1000}
        alt="square fabric image background"
        className="fixed top-0 left-0 w-full h-screen object-cover z-0"
      />
      <div className="relative max-w-7xl mx-auto z-10">
        <Card className="shadow-lg bg-[#fff5]">
          <CardHeader className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditingMass ? "Edit Mass" : "Create Mass"}
            </h1>
            <p className="text-sm text-slate-800">
              Set the liturgy details and choose songs for each section.
            </p>
          </CardHeader>
          <CardContent>
            <FieldSet className="w-full">
              <FieldGroup className="flex lg:flex-row flex-col w-full gap-8">
                <div className="section-one lg:w-1/2 w-full p-1 flex flex-col gap-8">
                  <Field>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input
                      id="title"
                      type="text"
                      value={mass?.title || ""}
                      onChange={(e) =>
                        handleUpdateMass("title", e.target.value)
                      }
                      placeholder="Thanksgiving mass..."
                    />
                    <FieldDescription>Title for the mass.</FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="date">Date</FieldLabel>
                    <FieldDescription>Date of the mass.</FieldDescription>
                    <Calendar
                      mode="single"
                      selected={mass?.date || new Date()}
                      onSelect={(val) => handleUpdateMass("date", val)}
                      className="rounded-lg border max-w-80 w-full"
                      captionLayout="dropdown"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="psalm">Psalm Response</FieldLabel>
                    <FieldDescription>
                      Response for the responsorial psalm.
                    </FieldDescription>
                    <Textarea
                      id="psalm"
                      value={mass?.psalmResponse || ""}
                      onChange={(e) =>
                        handleUpdateMass("psalmResponse", e.target.value)
                      }
                      placeholder="type here..."
                      className=""
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="notes">Other Notes</FieldLabel>
                    <FieldDescription>
                      Anything worth noting about the mass.
                    </FieldDescription>
                    <Textarea
                      id="notes"
                      value={mass?.notes || ""}
                      onChange={(e) =>
                        handleUpdateMass("notes", e.target.value)
                      }
                      placeholder="type here..."
                      className=""
                    />
                  </Field>
                </div>
                <div className="section-2 lg:w-1/2 w-full p-1 pb-4 flex flex-col gap-8">
                  <h3 className="h3 text-xl font-semibold">Songs</h3>
                  <Field>
                    <FieldLabel htmlFor="entrance">Entrance</FieldLabel>
                    <Select
                      onValueChange={(songId) =>
                        handleUpdateMass("entrance", {
                          ...mass?.entrance,
                          songId: normalizeSelectedSongId(songId),
                        })
                      }
                      value={mass?.entrance?.songId || NO_SONG_VALUE}
                      id="entrance"
                    >
                      <SelectTrigger className="w-full">
                        {renderSongSelectValue(
                          mass?.entrance?.songId,
                          "Entrance song",
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Entrance songs</SelectLabel>
                          <SelectItem value={NO_SONG_VALUE}>None</SelectItem>
                          {songs
                            ?.filter((s) => s.sections?.includes("entrance"))
                            ?.map((song, i) => {
                              return (
                                <SelectItem
                                  value={song._id}
                                  key={"entrance" + i}
                                >
                                  {song.title}
                                </SelectItem>
                              );
                            })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="kyrie">Kyrie</FieldLabel>
                    <Select
                      onValueChange={(songId) =>
                        handleUpdateMass("kyrie", {
                          ...mass?.kyrie,
                          songId: normalizeSelectedSongId(songId),
                        })
                      }
                      value={mass?.kyrie?.songId || NO_SONG_VALUE}
                      id="kyrie"
                    >
                      <SelectTrigger className="w-full">
                        {renderSongSelectValue(
                          mass?.kyrie?.songId,
                          "Kyrie song",
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Kyrie songs</SelectLabel>
                          <SelectItem value={NO_SONG_VALUE}>None</SelectItem>
                          {songs
                            ?.filter((s) => s.sections?.includes("kyrie"))
                            ?.map((song, i) => {
                              return (
                                <SelectItem value={song._id} key={"kyrie" + i}>
                                  {song.title}
                                </SelectItem>
                              );
                            })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="gloria">
                      Gloria
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={mass?.gloria?.included || false}
                          onCheckedChange={(included) =>
                            handleUpdateMass("gloria", {
                              ...mass?.gloria,
                              included,
                            })
                          }
                          id="gloria-included"
                        />
                        <Label htmlFor="gloria-included">included</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={
                            (mass?.gloria?.recited && mass?.gloria?.included) ||
                            false
                          }
                          disabled={!mass?.gloria?.included}
                          onCheckedChange={(recited) =>
                            handleUpdateMass("gloria", {
                              ...mass?.gloria,
                              recited,
                            })
                          }
                          id="gloria-recited"
                        />
                        <Label htmlFor="gloria-recited">recited</Label>
                      </div>
                    </FieldLabel>
                    {mass?.gloria?.included && (
                      <Select
                        onValueChange={(songId) =>
                          handleUpdateMass("gloria", {
                            ...mass?.gloria,
                            songId: normalizeSelectedSongId(songId),
                          })
                        }
                        value={mass?.gloria?.songId || NO_SONG_VALUE}
                        id="gloria"
                      >
                        <SelectTrigger className="w-full">
                          {renderSongSelectValue(
                            mass?.gloria?.songId,
                            "Gloria song",
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Gloria songs</SelectLabel>
                            <SelectItem value={NO_SONG_VALUE}>None</SelectItem>
                            {songs
                              ?.filter((s) => s.sections?.includes("gloria"))
                              ?.map((song, i) => {
                                return (
                                  <SelectItem
                                    value={song._id}
                                    key={"gloria" + i}
                                  >
                                    {song.title}
                                  </SelectItem>
                                );
                              })}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="acclamation">
                      Gospel Acclamation
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={mass?.acclamation?.recited || false}
                          onCheckedChange={(recited) =>
                            handleUpdateMass("acclamation", {
                              ...mass?.acclamation,
                              recited,
                            })
                          }
                          id="gospel-recited"
                        />
                        <Label htmlFor="gospel-recited">recited</Label>
                      </div>
                    </FieldLabel>
                    <Select
                      onValueChange={(songId) =>
                        handleUpdateMass("acclamation", {
                          ...mass?.acclamation,
                          songId: normalizeSelectedSongId(songId),
                        })
                      }
                      value={mass?.acclamation?.songId || NO_SONG_VALUE}
                      id="acclamation"
                    >
                      <SelectTrigger className="w-full">
                        {renderSongSelectValue(
                          mass?.acclamation?.songId,
                          "Gospel Acclamation song",
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Gospel Acclamation songs</SelectLabel>
                          <SelectItem value={NO_SONG_VALUE}>None</SelectItem>
                          {songs
                            ?.filter((s) => s.sections?.includes("acclamation"))
                            ?.map((song, i) => {
                              return (
                                <SelectItem
                                  value={song._id}
                                  key={"acclamation" + i}
                                >
                                  {song.title}
                                </SelectItem>
                              );
                            })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel>Gospel Of The Passion</FieldLabel>
                    <FieldDescription>
                      Add the proclamation entries that belong to the passion
                      reading.
                    </FieldDescription>
                    <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-theme-gold/30 bg-white/40 p-4">
                      <div className="">
                        <p className="font-medium text-slate-900">
                          {mass?.gospelOfThePassion?.length || 0} entries added
                        </p>
                        <p className="text-sm text-slate-700">
                          Open the editor to add, delete, and rearrange
                          sections.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setGospelPassionOpen(true)}
                        className="shrink-0"
                      >
                        <Plus className="size-4" />
                        Edit entries
                      </Button>
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="creed">
                      Creed
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={mass?.creed?.included || false}
                          onCheckedChange={(included) =>
                            handleUpdateMass("creed", {
                              ...mass?.creed,
                              included,
                            })
                          }
                          id="creed-included"
                        />
                        <Label htmlFor="creed-included">included</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={
                            (mass?.creed?.recited && mass?.creed?.included) ||
                            false
                          }
                          disabled={!mass?.creed?.included}
                          onCheckedChange={(recited) =>
                            handleUpdateMass("creed", {
                              ...mass?.creed,
                              recited,
                            })
                          }
                          id="creed-recited"
                        />
                        <Label htmlFor="creed-recited">recited</Label>
                      </div>
                    </FieldLabel>
                    {mass?.creed?.included && !mass?.creed?.recited && (
                      <Select
                        onValueChange={(songId) =>
                          handleUpdateMass("creed", {
                            ...mass?.creed,
                            songId: normalizeSelectedSongId(songId),
                          })
                        }
                        value={mass?.creed?.songId || NO_SONG_VALUE}
                        id="creed"
                      >
                        <SelectTrigger className="w-full">
                          {renderSongSelectValue(
                            mass?.creed?.songId,
                            "Creed song",
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Creed songs</SelectLabel>
                            <SelectItem value={NO_SONG_VALUE}>None</SelectItem>
                            {songs
                              ?.filter((s) => s.sections?.includes("creed"))
                              ?.map((song, i) => {
                                return (
                                  <SelectItem
                                    value={song._id}
                                    key={"creed" + i}
                                  >
                                    {song.title}
                                  </SelectItem>
                                );
                              })}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="petition">Petitions Song</FieldLabel>
                    <Select
                      onValueChange={(songId) =>
                        handleUpdateMass("petition", {
                          ...mass?.petition,
                          songId: normalizeSelectedSongId(songId),
                        })
                      }
                      value={mass?.petition?.songId || NO_SONG_VALUE}
                      id="petition"
                    >
                      <SelectTrigger className="w-full">
                        {renderSongSelectValue(
                          mass?.petition?.songId,
                          "Petitions song",
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Petition songs</SelectLabel>
                          <SelectItem value={NO_SONG_VALUE}>None</SelectItem>
                          {songs
                            ?.filter((s) => s.sections?.includes("petition"))
                            ?.map((song, i) => {
                              return (
                                <SelectItem
                                  value={song._id}
                                  key={"petition" + i}
                                >
                                  {song.title}
                                </SelectItem>
                              );
                            })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="LordsPrayer">
                      Lord's Prayer
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={mass?.LordsPrayer?.recited || false}
                          onCheckedChange={(recited) =>
                            handleUpdateMass("LordsPrayer", {
                              ...mass?.LordsPrayer,
                              recited,
                            })
                          }
                          id="LordsPrayer-recited"
                        />
                        <Label htmlFor="LordsPrayer-recited">recited</Label>
                      </div>
                    </FieldLabel>
                    {!mass?.LordsPrayer?.recited && (
                      <Select
                        onValueChange={(songId) =>
                          handleUpdateMass("LordsPrayer", {
                            ...mass?.LordsPrayer,
                            songId: normalizeSelectedSongId(songId),
                          })
                        }
                        value={mass?.LordsPrayer?.songId || NO_SONG_VALUE}
                        id="LordsPrayer"
                      >
                        <SelectTrigger className="w-full">
                          {renderSongSelectValue(
                            mass?.LordsPrayer?.songId,
                            "Lord's Prayer song",
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Lord's Prayer songs</SelectLabel>
                            <SelectItem value={NO_SONG_VALUE}>None</SelectItem>
                            {songs
                              ?.filter((s) =>
                                s.sections?.some((sect) =>
                                  ["Lord's prayer", "LordsPrayer"].includes(
                                    sect,
                                  ),
                                ),
                              )
                              ?.map((song, i) => {
                                return (
                                  <SelectItem
                                    value={song._id}
                                    key={"LordsPrayer" + i}
                                  >
                                    {song.title}
                                  </SelectItem>
                                );
                              })}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="offertory">Offertory</FieldLabel>
                    <Select
                      onValueChange={(songId) =>
                        handleUpdateMass("offertory", {
                          ...mass?.offertory,
                          songId: normalizeSelectedSongId(songId),
                        })
                      }
                      value={mass?.offertory?.songId || NO_SONG_VALUE}
                      id="offertory"
                    >
                      <SelectTrigger className="w-full">
                        {renderSongSelectValue(
                          mass?.offertory?.songId,
                          "Offertory song",
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Offertory songs</SelectLabel>
                          <SelectItem value={NO_SONG_VALUE}>None</SelectItem>
                          {songs
                            ?.filter((s) => s.sections?.includes("offertory"))
                            ?.map((song, i) => {
                              return (
                                <SelectItem
                                  value={song._id}
                                  key={"offertory" + i}
                                >
                                  {song.title}
                                </SelectItem>
                              );
                            })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="sanctus">Sanctus</FieldLabel>
                    <Select
                      onValueChange={(songId) =>
                        handleUpdateMass("sanctus", {
                          ...mass?.sanctus,
                          songId: normalizeSelectedSongId(songId),
                        })
                      }
                      value={mass?.sanctus?.songId || NO_SONG_VALUE}
                      id="sanctus"
                    >
                      <SelectTrigger className="w-full">
                        {renderSongSelectValue(
                          mass?.sanctus?.songId,
                          "Sanctus song",
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Sanctus songs</SelectLabel>
                          <SelectItem value={NO_SONG_VALUE}>None</SelectItem>
                          {songs
                            ?.filter((s) => s.sections?.includes("sanctus"))
                            ?.map((song, i) => {
                              return (
                                <SelectItem
                                  value={song._id}
                                  key={"sanctus" + i}
                                >
                                  {song.title}
                                </SelectItem>
                              );
                            })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="peace">Peace</FieldLabel>
                    <Select
                      onValueChange={(songId) =>
                        handleUpdateMass("peace", {
                          ...mass?.peace,
                          songId: normalizeSelectedSongId(songId),
                        })
                      }
                      value={mass?.peace?.songId || NO_SONG_VALUE}
                      id="peace"
                    >
                      <SelectTrigger className="w-full">
                        {renderSongSelectValue(
                          mass?.peace?.songId,
                          "Peace song",
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Peace songs</SelectLabel>
                          <SelectItem value={NO_SONG_VALUE}>None</SelectItem>
                          {songs
                            ?.filter((s) => s.sections?.includes("peace"))
                            ?.map((song, i) => {
                              return (
                                <SelectItem value={song._id} key={"peace" + i}>
                                  {song.title}
                                </SelectItem>
                              );
                            })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="agnusDei">Agnus Dei</FieldLabel>
                    <Select
                      onValueChange={(songId) =>
                        handleUpdateMass("agnusDei", {
                          ...mass?.agnusDei,
                          songId: normalizeSelectedSongId(songId),
                        })
                      }
                      value={mass?.agnusDei?.songId || NO_SONG_VALUE}
                      id="agnusDei"
                    >
                      <SelectTrigger className="w-full">
                        {renderSongSelectValue(
                          mass?.agnusDei?.songId,
                          "Agnus Dei song",
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Agnus Dei songs</SelectLabel>
                          <SelectItem value={NO_SONG_VALUE}>None</SelectItem>
                          {songs
                            ?.filter((s) =>
                              s.sections?.some((sect) =>
                                ["agnus Dei", "agnusDei"].includes(sect),
                              ),
                            )
                            ?.map((song, i) => {
                              return (
                                <SelectItem
                                  value={song._id}
                                  key={"agnusDei" + i}
                                >
                                  {song.title}
                                </SelectItem>
                              );
                            })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="holyCommunion">
                      Holy Communion
                    </FieldLabel>
                    <Select
                      onValueChange={(songId) =>
                        handleUpdateMass("holyCommunion", {
                          ...mass?.holyCommunion,
                          songId: normalizeSelectedSongId(songId),
                        })
                      }
                      value={mass?.holyCommunion?.songId || NO_SONG_VALUE}
                      id="holyCommunion"
                    >
                      <SelectTrigger className="w-full">
                        {renderSongSelectValue(
                          mass?.holyCommunion?.songId,
                          "Holy Communion song",
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Holy Communion songs</SelectLabel>
                          <SelectItem value={NO_SONG_VALUE}>None</SelectItem>
                          {songs
                            ?.filter((s) =>
                              s.sections?.some((sect) =>
                                ["holy communion", "holyCommunion"].includes(
                                  sect,
                                ),
                              ),
                            )
                            ?.map((song, i) => {
                              return (
                                <SelectItem
                                  value={song._id}
                                  key={"holyCommunion" + i}
                                >
                                  {song.title}
                                </SelectItem>
                              );
                            })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="thanksgiving">
                      Thanksgiving
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={mass?.thanksgiving?.included || false}
                          onCheckedChange={(included) =>
                            handleUpdateMass("thanksgiving", {
                              ...mass?.thanksgiving,
                              included,
                            })
                          }
                          id="thanksgiving-included"
                        />
                        <Label htmlFor="thanksgiving-included">included</Label>
                      </div>
                    </FieldLabel>
                    {mass?.thanksgiving?.included && (
                      <Select
                        onValueChange={(songId) =>
                          handleUpdateMass("thanksgiving", {
                            ...mass?.thanksgiving,
                            songId: normalizeSelectedSongId(songId),
                          })
                        }
                        value={mass?.thanksgiving?.songId || NO_SONG_VALUE}
                        id="thanksgiving"
                      >
                        <SelectTrigger className="w-full">
                          {renderSongSelectValue(
                            mass?.thanksgiving?.songId,
                            "Thanksgiving song",
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Thanksgiving songs</SelectLabel>
                            <SelectItem value={NO_SONG_VALUE}>None</SelectItem>
                            {songs
                              ?.filter((s) =>
                                s.sections?.includes("thanksgiving"),
                              )
                              ?.map((song, i) => {
                                return (
                                  <SelectItem
                                    value={song._id}
                                    key={"thanksgiving" + i}
                                  >
                                    {song.title}
                                  </SelectItem>
                                );
                              })}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="exit">Exit</FieldLabel>
                    <Select
                      onValueChange={(songId) =>
                        handleUpdateMass("exit", {
                          ...mass?.exit,
                          songId: normalizeSelectedSongId(songId),
                        })
                      }
                      value={mass?.exit?.songId || NO_SONG_VALUE}
                      id="exit"
                    >
                      <SelectTrigger className="w-full">
                        {renderSongSelectValue(mass?.exit?.songId, "Exit song")}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Exit songs</SelectLabel>
                          <SelectItem value={NO_SONG_VALUE}>None</SelectItem>
                          {songs
                            ?.filter((s) => s.sections?.includes("exit"))
                            ?.map((song, i) => {
                              return (
                                <SelectItem value={song._id} key={"exit" + i}>
                                  {song.title}
                                </SelectItem>
                              );
                            })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Button
                    onClick={handleSubmit}
                    disabled={isCreating || isSubmittingEdit || !canSave}
                    className="w-max p-3 ml-auto mt-4"
                  >
                    {isCreating || isSubmittingEdit
                      ? "Saving..."
                      : isEditingMass
                        ? "Update Mass"
                        : "Create Mass"}
                  </Button>
                </div>
              </FieldGroup>
            </FieldSet>

            <GospelOfThePassion
              list={mass?.gospelOfThePassion || []}
              setList={(nextList) =>
                handleUpdateMass("gospelOfThePassion", nextList)
              }
              open={gospelPassionOpen}
              onOpenChange={setGospelPassionOpen}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MassEditor;
