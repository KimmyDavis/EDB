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

const MassEditor = ({ params }) => {
  // hooks
  const { massId } = use(params);
  const { isEditor } = useAuth();
  const { data: songsData, isLoading, isError } = useSelector(selectAllSongs);
  const songs = songsData?.songs || [];

  // state
  const [date, setDate] = useState(new Date());
  const [mass, setMass] = useState({
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
  });

  // handlers
  const handleUpdateMass = (field, value) => {
    let tmpMass = mass;
    tmpMass[field] = value;
    setMass({ ...tmpMass });
  };

  // effects
  useEffect(() => {
    console.log(mass);
  }, [mass]);

  if (!isEditor) {
    return (
      <div className="not-editor w-full text-center">
        <p>Restricted page.</p>
      </div>
    );
  }

  return (
    <div className="mass-editor flex items-center justify-center p-5 w-full">
      <FieldSet className="w-full">
        <FieldGroup className="flex flex-row flex-nowrap w-full">
          <div className="section-one w-1/2 min-w-80 p-3 flex flex-col gap-10">
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                type="text"
                placeholder="Thanksgiving mass..."
              />
              <FieldDescription>Title for the mass.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="date">Date</FieldLabel>
              <FieldDescription>Date of the mass.</FieldDescription>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
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
                // value={verse}
                // onChange={(e) => handleVerseEdit(e, i)}
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
                // value={verse}
                // onChange={(e) => handleVerseEdit(e, i)}
                className=""
              />
            </Field>
          </div>
          <div className="section-2 w-1/2 min-w-80 p-2 flex flex-col gap-3 pr-10">
            <Field>
              <FieldLabel htmlFor="entrance">Entrance</FieldLabel>
              <Select
                onValueChange={(id) => handleUpdateMass("entrance", { id })}
                value={mass?.entrance?.id || ""}
                id="entrance"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Entrance song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Entrance songs</SelectLabel>
                    {songs
                      ?.filter((s) => s.section == "entrance")
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
                onValueChange={(id) => handleUpdateMass("kyrie", { id })}
                value={mass?.kyrie?.id || ""}
                id="kyrie"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Kyrie song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kyrie songs</SelectLabel>
                    {songs
                      ?.filter((s) => s.section == "kyrie")
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
                  onValueChange={(id) => handleUpdateMass("gloria", { id })}
                  value={mass?.gloria?.id || ""}
                  id="gloria"
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Gloria song" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Gloria songs</SelectLabel>
                      {songs
                        ?.filter((s) => s.section == "gloria")
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
                onValueChange={(id) => handleUpdateMass("acclamation", { id })}
                value={mass?.acclamation?.id || ""}
                id="acclamation"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Gospel Acclamation song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Gospel Acclamation songs</SelectLabel>
                    {songs
                      ?.filter((s) => s.section == "acclamation")
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
                  onValueChange={(id) => handleUpdateMass("creed", { id })}
                  value={mass?.creed?.id || ""}
                  id="creed"
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Creed song" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Creed songs</SelectLabel>
                      {songs
                        ?.filter((s) => s.section == "creed")
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
                  onValueChange={(id) =>
                    handleUpdateMass("LordsPrayer", { id })
                  }
                  value={mass?.LordsPrayer?.id || ""}
                  id="LordsPrayer"
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Lord's Prayer song" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Lord's Prayer songs</SelectLabel>
                      {songs
                        ?.filter((s) => s.section == "LordsPrayer")
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
                onValueChange={(id) => handleUpdateMass("offertory", { id })}
                value={mass?.offertory?.id || ""}
                id="offertory"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Offertory song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Offertory songs</SelectLabel>
                    {songs
                      ?.filter((s) => s.section == "offertory")
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
                onValueChange={(id) => handleUpdateMass("sanctus", { id })}
                value={mass?.sanctus?.id || ""}
                id="sanctus"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sanctus song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sanctus songs</SelectLabel>
                    {songs
                      ?.filter((s) => s.section == "sanctus")
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
                onValueChange={(id) => handleUpdateMass("peace", { id })}
                value={mass?.peace?.id || ""}
                id="peace"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Peace song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Peace songs</SelectLabel>
                    {songs
                      ?.filter((s) => s.section == "peace")
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
                onValueChange={(id) => handleUpdateMass("agnusDei", { id })}
                value={mass?.agnusDei?.id || ""}
                id="agnusDei"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Agnus Dei song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Agnus Dei songs</SelectLabel>
                    {songs
                      ?.filter((s) => s.section == "agnusDei")
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
                onValueChange={(id) =>
                  handleUpdateMass("holyCommunion", { id })
                }
                value={mass?.holyCommunion?.id || ""}
                id="holyCommunion"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Holy Communion song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Holy Communion songs</SelectLabel>
                    {songs
                      ?.filter((s) => s.section == "holyCommunion")
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
                  onValueChange={(id) =>
                    handleUpdateMass("thanksgiving", { id })
                  }
                  value={mass?.thanksgiving?.id || ""}
                  id="thanksGiving"
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Thanksgiving song" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Thanksgiving songs</SelectLabel>
                      {songs
                        ?.filter((s) => s.section == "thanksgiving")
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
                onValueChange={(id) => handleUpdateMass("exit", { id })}
                value={mass?.exit?.id || ""}
                id="exit"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Exit song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Exit songs</SelectLabel>
                    {songs
                      ?.filter((s) => s.section == "exit")
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
          </div>
        </FieldGroup>
      </FieldSet>
    </div>
  );
};

export default MassEditor;
