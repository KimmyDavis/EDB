"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Validator from "validatorjs";
import { eventsApiSlice } from "@/features/events/eventsApiSlice";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import { use } from "react";
// color picker
import {
  ColorPicker,
  ColorPickerAlphaSlider,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerEyeDropper,
  ColorPickerFormatSelect,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from "@/components/ui/color-picker";
import { useEffect } from "react";

const CreateEventPage = ({ params }) => {
  const { eventCode } = use(params);
  const router = useRouter();
  const [createEvent, { isLoading }] = eventsApiSlice.useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] =
    eventsApiSlice.useUpdateEventMutation();

  // events data
  const {
    data: eventsResponse,
    isLoading: eventLoading,
    error,
    refetch,
  } = eventsApiSlice.useQueryEventsQuery(
    {
      eventId: eventCode,
      title: "",
      startDate: "",
      endDate: "",
      date: "",
      venue: "",
      code: "",
      theme: "",
    },
    { skip: eventCode == "new" },
  );
  const eventToEdit = eventsResponse?.event;

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    venue: "",
    description: "",
    fee: "",
    maxParticipants: "",
    deadline: "",
    theme: "#7851ed",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Validate field
    validateField(field, value);
  };

  const validateField = (field, value) => {
    const rules = {
      title: "required|string|min:3",
      date: "required|date",
      venue: "required|string|min:3",
      description: "required|string|min:10",
      fee: "numeric|min:0",
      maxParticipants: "integer|min:1",
      deadline: "date",
      theme: "string",
    };

    const data = { [field]: value };

    if (!rules[field]) {
      return;
    }

    const validation = new Validator(data, { [field]: rules[field] });

    if (validation.fails()) {
      setErrors((prev) => ({
        ...prev,
        [field]: validation.errors.first(field),
      }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const rules = {
      title: "required|string|min:3",
      date: "required|date",
      venue: "required|string|min:3",
      description: "required|string|min:10",
      fee: "numeric|min:0",
      maxParticipants: "integer|min:1",
      deadline: "date",
    };

    const validation = new Validator(formData, rules);

    if (validation.fails()) {
      const newErrors = {};
      Object.keys(rules).forEach((field) => {
        newErrors[field] = validation.errors.first(field);
      });
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      // Prepare data - only include optional fields if they have values
      const eventData = {
        title: formData.title,
        date: formData.date,
        venue: formData.venue,
        description: formData.description,
        fee: formData.fee ? parseFloat(formData.fee) : undefined,
        maxParticipants: formData.maxParticipants
          ? parseInt(formData.maxParticipants, 10)
          : undefined,
        deadline: formData.deadline || undefined,
        theme: formData.theme || undefined,
      };

      // Remove undefined fields
      Object.keys(eventData).forEach(
        (key) => eventData[key] === undefined && delete eventData[key],
      );

      if (eventCode === "new") {
        const createResponse = await createEvent(eventData).unwrap();
      }
      const updateResponse = await updateEvent({
        id: eventCode,
        ...eventData,
      }).unwrap();
      console.log(updateResponse);

      toast.success("Event submitted successfully!");
      router.push("/home/events");
    } catch (error) {
      console.error("Failed to submit event:", error);
      toast.error(
        error?.data?.message ||
          "Failed to creasubmitte event. Please try again.",
      );
    }
  };

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title,
        date: eventToEdit.date,
        venue: eventToEdit.venue,
        description: eventToEdit.description,
        fee: eventToEdit.fee || "",
        maxParticipants: eventToEdit.maxParticipants || "",
        deadline: eventToEdit.deadline,
        theme: eventToEdit.theme,
      });
    }
  }, [eventToEdit]);

  return (
    <div className="relative bg-theme-gold/90 min-h-screen p-6">
      <Image
        src="/images/backgrounds/fabric-of-squares.png"
        width={1000}
        height={1000}
        alt="square frabric image background"
        className="fixed top-0 left-0 w-full h-screen object-cover z-0"
      />
      <div className="relative max-w-2xl mx-auto z-10">
        <Card className="shadow-lg bg-[#fff5]">
          <CardHeader className="space-y-1">
            <h1 className="text-2xl font-bold">Create New Event</h1>
            <p className="text-sm text-slate-800">
              Fill in the details to create a new event
            </p>
          </CardHeader>

          <CardContent className=" ">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Required Fields */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Required Information</h3>

                <Field className="gap-1.5">
                  <FieldLabel
                    htmlFor="title"
                    className="text-sm text-slate-800 font-normal"
                  >
                    Event Title *
                  </FieldLabel>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter event title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                    className="dark:bg-background h-9 text-sm shadow-xs text-slate-800 font-normal"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title}</p>
                  )}
                </Field>

                <Field className="gap-1.5">
                  <FieldLabel
                    htmlFor="date"
                    className="text-sm text-slate-800 font-normal"
                  >
                    Event Date *
                  </FieldLabel>
                  <div className="scale-70 origin-top-left">
                    <Calendar
                      mode="single"
                      selected={formData.date || new Date()}
                      onSelect={(val) => handleChange("date", val)}
                      className="rounded-lg border max-w-80 w-full"
                      captionLayout="dropdown"
                    />
                  </div>
                  {errors.date && (
                    <p className="text-red-500 text-sm">{errors.date}</p>
                  )}
                </Field>

                <Field className="gap-1.5 -mt-24">
                  <FieldLabel
                    htmlFor="venue"
                    className="text-sm text-slate-800 font-normal"
                  >
                    Venue *
                  </FieldLabel>
                  <Input
                    id="venue"
                    type="text"
                    placeholder="Enter event venue"
                    value={formData.venue}
                    onChange={(e) => handleChange("venue", e.target.value)}
                    required
                    className="dark:bg-background h-9 text-sm shadow-xs text-slate-800 font-normal"
                  />
                  {errors.venue && (
                    <p className="text-red-500 text-sm">{errors.venue}</p>
                  )}
                </Field>

                <Field className="gap-1.5">
                  <FieldLabel
                    htmlFor="description"
                    className="text-sm text-slate-800 font-normal"
                  >
                    Description *
                  </FieldLabel>
                  <Textarea
                    id="description"
                    placeholder="Enter event description"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    required
                    className="dark:bg-background text-sm shadow-xs text-slate-800 font-normal"
                    rows="4"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm">{errors.description}</p>
                  )}
                </Field>
              </div>

              {/* Optional Fields */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Optional Information</h3>

                <Field className="gap-1.5">
                  <FieldLabel
                    htmlFor="fee"
                    className="text-sm text-slate-800 font-normal"
                  >
                    Fee
                  </FieldLabel>
                  <Input
                    id="fee"
                    type="number"
                    placeholder="Enter fee amount"
                    value={formData.fee}
                    onChange={(e) => handleChange("fee", e.target.value)}
                    min="0"
                    step="0.01"
                    className="dark:bg-background h-9 text-sm shadow-xs text-slate-800 font-normal"
                  />
                  {errors.fee && (
                    <p className="text-red-500 text-sm">{errors.fee}</p>
                  )}
                </Field>

                <Field className="gap-1.5">
                  <FieldLabel
                    htmlFor="maxParticipants"
                    className="text-sm text-slate-800 font-normal"
                  >
                    Max Participants
                  </FieldLabel>
                  <Input
                    id="maxParticipants"
                    type="number"
                    placeholder="Enter maximum number of participants"
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      handleChange("maxParticipants", e.target.value)
                    }
                    min="1"
                    className="dark:bg-background h-9 text-sm shadow-xs text-slate-800 font-normal"
                  />
                  {errors.maxParticipants && (
                    <p className="text-red-500 text-sm">
                      {errors.maxParticipants}
                    </p>
                  )}
                </Field>

                <Field className="gap-1.5">
                  <FieldLabel
                    htmlFor="deadline"
                    className="text-sm text-slate-800 font-normal"
                  >
                    Registration Deadline
                  </FieldLabel>
                  <div className="scale-70 origin-top-left">
                    <Calendar
                      mode="single"
                      selected={formData.deadline || new Date()}
                      onSelect={(val) => handleChange("deadline", val)}
                      className="rounded-lg border max-w-80 w-full"
                      captionLayout="dropdown"
                    />
                  </div>
                  {errors.deadline && (
                    <p className="text-red-500 text-sm">{errors.deadline}</p>
                  )}
                </Field>

                <Field className="gap-1.5 -mt-24">
                  <FieldLabel
                    htmlFor="theme"
                    className="text-sm text-slate-800 font-normal"
                  >
                    Theme Color
                  </FieldLabel>
                  <div className="flex items-center gap-3">
                    <ColorPicker
                      value={formData.theme}
                      onValueChange={(color) => handleChange("theme", color)}
                      defaultFormat="hex"
                      defaultValue="#3b82f6"
                    >
                      <ColorPickerTrigger className="bg-transparent">
                        <ColorPickerSwatch />
                      </ColorPickerTrigger>
                      <ColorPickerContent>
                        <ColorPickerArea />
                        <div className="flex items-center gap-2">
                          <ColorPickerEyeDropper />
                          <div className="flex flex-1 flex-col gap-2">
                            <ColorPickerHueSlider />
                            <ColorPickerAlphaSlider />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ColorPickerFormatSelect />
                          <ColorPickerInput />
                        </div>
                      </ColorPickerContent>
                    </ColorPicker>

                    <span className="text-sm text-slate-800">
                      {formData.theme}
                    </span>
                  </div>
                  {errors.theme && (
                    <p className="text-red-500 text-sm">{errors.theme}</p>
                  )}
                </Field>
              </div>
            </form>
          </CardContent>

          <CardFooter className="gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => router.push("../")}
              disabled={isLoading || isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/80"
            >
              {isLoading
                ? "Creating..."
                : isUpdating
                  ? "Updating..."
                  : eventCode === "new"
                    ? "Create Event"
                    : "Update event"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CreateEventPage;
