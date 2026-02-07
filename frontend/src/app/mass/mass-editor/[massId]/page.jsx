"use client";
import useAuth from "@/hooks/use-auth";
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
  thanksGiving: {
    included: true,
  },
  gloria: {
    included: true,
  },
};

const MassEditor = ({ params }) => {
  // hooks
  const router = useRouter();
  const { massId } = use(params);
  const { isEditor } = useAuth();
  const { data: songsData, isLoading, isError } = useSelector(selectAllSongs);
  const songs = songsData?.songs || [];
  const {
    data: massToEdit,
    isLoading: massToEditLoading,
    isError: massToEditIsError,
    error: massToeditError,
  } = useQueryMassQuery({ id: massId }, { skip: massId == "new" });
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
  const [isEditingMass, setIsEditingMass] = useState(massId != "new" ?? false);
  const [mass, setMass] = useState(starterMassTemplate);
  const [canSave, setCanSave] = useState(false);

  // handlers
  const handleUpdateMass = (field, value) => {
    let tmpMass = { ...mass };
    tmpMass[field] = value;
    setMass({ ...tmpMass });
  };
  const handleSubmit = async () => {
    if (isEditingMass) {
      await editMass({ ...mass, id: massId });
    } else {
      await createMass(mass);
    }
  };

  // effects
  useEffect(() => {
    setCanSave(mass.title && mass.date);
  }, [mass]);
  useEffect(() => {
    if (massToEdit && !massToEditIsError)
      setMass(massToEdit?.mass[0] ?? { ...mass });
  }, [massToEdit]);

  useEffect(() => {
    if (isEditSuccess || isCreateSuccess) {
      toast.success("Mass successfully submitted! 🥳", {
        position: "top-center",
      });
      setMass(starterMassTemplate);
      router.push("/mass");
    }
  }, [isCreateSuccess, isEditSuccess]);
  useEffect(() => {
    if (isCreateError || isEditError) {
      toast.error("Failed to submit 😔", { position: "top-center" });
      setMass(starterMassTemplate);
      router.push("/mass");
    }
  }, [isCreateError, isEditError]);

  if (!isEditor) {
    return (
      <div className="not-editor w-full text-center">
        <p>Restricted page.</p>
      </div>
    );
  }
  if (isLoading) {
    return <div className="loading">Loading song library...</div>;
  }
  if (isError) {
    return <div className="error">Error loading song library...</div>;
  }
  if (!songs?.length) {
    return (
      <div className="no songs">
        No song found... try reloading or adding a song.
      </div>
    );
  }

  if (massToEditLoading) {
    return <div className="loading">Loading mass...</div>;
  }
  if (massToEditIsError) {
    return (
      <div className="loading">
        Error Loading mass... {massToeditError?.data?.message}
      </div>
    );
  }

  return (
    <div className="mass-editor flex items-center justify-center p-5 w-full">
      <FieldSet className="w-full">
        <FieldGroup className="flex sm:flex-row flex-col w-full">
          <div className="section-one sm:w-1/2 w-full min-w-80 p-3 flex flex-col gap-10">
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                type="text"
                value={mass?.title || ""}
                onChange={(e) => handleUpdateMass("title", e.target.value)}
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
                onChange={(e) => handleUpdateMass("notes", e.target.value)}
                placeholder="type here..."
                className=""
              />
            </Field>
          </div>
          <div className="section-2 sm:w-1/2 w-full min-w-80 p-2 pb-10 flex flex-col gap-8 pr-10">
            <h3 className="h3 text-xl font-semibold">Songs</h3>
            <Field>
              <FieldLabel htmlFor="entrance">Entrance</FieldLabel>
              <Select
                onValueChange={(songId) =>
                  handleUpdateMass("entrance", { ...mass?.entrance, songId })
                }
                value={mass?.entrance?.songId || ""}
                id="entrance"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Entrance song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Entrance songs</SelectLabel>
                    {songs
                      ?.filter((s) => s.sections?.includes("entrance"))
                      ?.map((song, i) => {
                        return (
                          <SelectItem value={song._id} key={"entrance" + i}>
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
                  handleUpdateMass("kyrie", { ...mass?.kyrie, songId })
                }
                value={mass?.kyrie?.songId || ""}
                id="kyrie"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Kyrie song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kyrie songs</SelectLabel>
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
                      (mass?.gloria?.recited && mass?.gloria?.included) || false
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
                    handleUpdateMass("gloria", { ...mass?.gloria, songId })
                  }
                  value={mass?.gloria?.songId || ""}
                  id="gloria"
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Gloria song" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Gloria songs</SelectLabel>
                      {songs
                        ?.filter((s) => s.sections?.includes("gloria"))
                        ?.map((song, i) => {
                          return (
                            <SelectItem value={song._id} key={"gloria" + i}>
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
                    songId,
                  })
                }
                value={mass?.acclamation?.songId || ""}
                id="acclamation"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Gospel Acclamation song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Gospel Acclamation songs</SelectLabel>
                    {songs
                      ?.filter((s) => s.sections?.includes("acclamation"))
                      ?.map((song, i) => {
                        return (
                          <SelectItem value={song._id} key={"acclamation" + i}>
                            {song.title}
                          </SelectItem>
                        );
                      })}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
                      (mass?.creed?.recited && mass?.creed?.included) || false
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
                    handleUpdateMass("creed", { ...mass?.creed, songId })
                  }
                  value={mass?.creed?.songId || ""}
                  id="creed"
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Creed song" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Creed songs</SelectLabel>
                      {songs
                        ?.filter((s) => s.sections?.includes("creed"))
                        ?.map((song, i) => {
                          return (
                            <SelectItem value={song._id} key={"creed" + i}>
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
                    songId,
                  })
                }
                value={mass?.petition?.songId || ""}
                id="petition"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lord's Prayer song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Petition songs</SelectLabel>
                    {songs
                      ?.filter((s) => s.sections?.includes("petition"))
                      ?.map((song, i) => {
                        return (
                          <SelectItem value={song._id} key={"petition" + i}>
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
                      songId,
                    })
                  }
                  value={mass?.LordsPrayer?.songId || ""}
                  id="LordsPrayer"
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Lord's Prayer song" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Lord's Prayer songs</SelectLabel>
                      {songs
                        ?.filter((s) =>
                          s.sections?.some((sect) =>
                            ["Lord's prayer", "LordsPrayer"].includes(sect)
                          )
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
                  handleUpdateMass("offertory", { ...mass?.offertory, songId })
                }
                value={mass?.offertory?.songId || ""}
                id="offertory"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Offertory song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Offertory songs</SelectLabel>
                    {songs
                      ?.filter((s) => s.sections?.includes("offertory"))
                      ?.map((song, i) => {
                        return (
                          <SelectItem value={song._id} key={"offertory" + i}>
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
                  handleUpdateMass("sanctus", { ...mass?.sanctus, songId })
                }
                value={mass?.sanctus?.songId || ""}
                id="sanctus"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sanctus song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sanctus songs</SelectLabel>
                    {songs
                      ?.filter((s) => s.sections?.includes("sanctus"))
                      ?.map((song, i) => {
                        return (
                          <SelectItem value={song._id} key={"sanctus" + i}>
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
                  handleUpdateMass("peace", { ...mass?.peace, songId })
                }
                value={mass?.peace?.songId || ""}
                id="peace"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Peace song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Peace songs</SelectLabel>
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
                  handleUpdateMass("agnusDei", { ...mass?.agnusDei, songId })
                }
                value={mass?.agnusDei?.songId || ""}
                id="agnusDei"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Agnus Dei song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Agnus Dei songs</SelectLabel>
                    {songs
                      ?.filter((s) =>
                        s.sections?.some((sect) =>
                          ["agnus Dei", "agnusDei"].includes(sect)
                        )
                      )
                      ?.map((song, i) => {
                        return (
                          <SelectItem value={song._id} key={"agnusDei" + i}>
                            {song.title}
                          </SelectItem>
                        );
                      })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="holyCommunion">Holy Communion</FieldLabel>
              <Select
                onValueChange={(songId) =>
                  handleUpdateMass("holyCommunion", {
                    ...mass?.holyCommunion,
                    songId,
                  })
                }
                value={mass?.holyCommunion?.songId || ""}
                id="holyCommunion"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Holy Communion song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Holy Communion songs</SelectLabel>
                    {songs
                      ?.filter((s) =>
                        s.sections?.some((sect) =>
                          ["holy communion", "holyCommunion"].includes(sect)
                        )
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
                    checked={mass?.thanksGiving?.included || false}
                    onCheckedChange={(included) =>
                      handleUpdateMass("thanksGiving", {
                        ...mass?.thanksGiving,
                        included,
                      })
                    }
                    id="thanksGiving-included"
                  />
                  <Label htmlFor="thanksGiving-included">included</Label>
                </div>
              </FieldLabel>
              {mass?.thanksGiving?.included && (
                <Select
                  onValueChange={(songId) =>
                    handleUpdateMass("thanksgiving", {
                      ...mass?.thanksGiving,
                      songId,
                    })
                  }
                  value={mass?.thanksgiving?.songId || ""}
                  id="thanksGiving"
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Thanksgiving song" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Thanksgiving songs</SelectLabel>
                      {songs
                        ?.filter((s) => s.sections?.includes("thanksgiving"))
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
                  handleUpdateMass("exit", { ...mass?.exit, songId })
                }
                value={mass?.exit?.songId || ""}
                id="exit"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Exit song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Exit songs</SelectLabel>
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
              className="w-max p-3 ml-auto my-10"
            >
              Submit
            </Button>
          </div>
        </FieldGroup>
      </FieldSet>
    </div>
  );
};

export default MassEditor;
