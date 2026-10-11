"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { authClient } from "@/lib/authClient";
import { ArrowLeft } from "lucide-react";
import { User } from "lucide-react";
import { User2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useEffect } from "react";
import Validator from "validatorjs";
import { getNames } from "country-list";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ProfileForm = () => {
  const router = useRouter();
  const { data, error, isPending } = authClient.useSession();
  const { user } = data || {};

  const countries = getNames();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    matricule: "",
    passport: "",
    algerianId: "",
    country: "",
    dateOfBirth: "",
    course: "",
    language: "",
    gender: "",
  });

  const [errors, setErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showPolicyNotice, setShowPolicyNotice] = useState(false);

  const REQUIRED_FIELDS = [
    { key: "name", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "username", label: "Username" },
    { key: "gender", label: "Gender" },
    { key: "phone", label: "Phone" },
    { key: "passport", label: "Passport number" },
    { key: "matricule", label: "Matricule number" },
    { key: "country", label: "Country" },
    { key: "language", label: "Language" },
    { key: "algerianId", label: "Algerian ID" },
    { key: "course", label: "Course" },
    { key: "dateOfBirth", label: "Date of birth" },
  ];

  const missingFields = REQUIRED_FIELDS.filter(
    ({ key }) => !formData[key] || errors[key],
  );
  const isFieldMissing = (key) =>
    missingFields.some((field) => field.key === key);

  useEffect(() => {
    if (!user) return;

    const {
      email,
      name,
      username,
      phone,
      matricule,
      passport,
      algerianId,
      country,
      dateOfBirth,
      course,
      language,
      gender,
    } = user || {};

    let localFormData = JSON.parse(localStorage.getItem("profileInfo")) || null;
    if (!!localFormData) {
      localFormData.dateOfBirth = localFormData.dateOfBirth
        ? new Date(localFormData.dateOfBirth)
        : "";
      setFormData(localFormData);
    } else
      setFormData({
        name: name || "",
        email: email || "",
        username: username || "",
        phone: phone || "",
        matricule: matricule || "",
        passport: passport || "",
        algerianId: algerianId || "",
        country: country || "",
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : "",
        course: course || "",
        language: language || "",
        gender: gender || "",
      });
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "dateOfBirth") {
      setErrors((prev) => ({
        ...prev,
        dateOfBirth: value ? "" : "The date of birth is required.",
      }));
      return;
    }

    // Validation rules
    const rules = {
      name: "required|string|min:3",
      email: "required|email",
      username: "required|string|min:3",
      phone: "required|regex:/^\\+?\\d{9,15}$/",
      matricule: "required|string|min:5",
      passport: "required|string|min:5",
      algerianId: "required|string|min:6",
      country: "required|string",
      course: "required|string",
      language: "required|string",
      gender: "required|in:m,f",
    };

    const data = { [field]: value };
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

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day} ${d.toLocaleString("en-US", { month: "short" })}, ${year}`;
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.email &&
      formData.username &&
      formData.phone &&
      formData.passport &&
      formData.algerianId &&
      formData.country &&
      formData.dateOfBirth &&
      formData.course &&
      formData.language &&
      formData.gender &&
      formData.matricule &&
      !Object.values(errors).some(Boolean)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUpdating(true);

    try {
      const { data } = await authClient.updateUser({
        name: formData.name,
        username: formData.username.replaceAll(" ", ""),
        phone: formData.phone,
        matricule: formData.matricule.toLocaleLowerCase(),
        passport: formData.passport,
        algerianId: formData.algerianId,
        country: formData.country,
        dateOfBirth: formData.dateOfBirth || null,
        course: formData.course,
        language: formData.language,
        gender: formData.gender,
      });
      if (data?.status) {
        localStorage.removeItem("profileInfo");
        toast.success("Profile updated successfully!");
        router.push("/home");
      }
    } catch (error) {
      toast.error("Failed to update profile: " + error.message);
    }
    setIsUpdating(false);
  };

  const handleDeleteAccount = async () => {
    const shouldDelete = window.confirm(
      "Delete your account permanently? This action cannot be undone.",
    );

    if (!shouldDelete) return;

    setIsDeletingAccount(true);

    try {
      const { error } = await authClient.deleteUser({ callbackURL: "/" });

      if (error) {
        toast.error(
          error.message ||
            "Could not delete account. Please sign in again and retry.",
        );
        return;
      }

      localStorage.removeItem("profileInfo");
      toast.success("Your account has been deleted.");
      router.push("/");
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const cancelEdit = () => {
    localStorage.removeItem("profileInfo");
    router.push("/home");
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/home");
    }
  };

  useEffect(() => {
    if (!!formData.email)
      localStorage.setItem("profileInfo", JSON.stringify(formData));
  }, [formData]);

  return (
    <section className="relative py-8 sm:py-16 lg:py-20 bg-theme-gold">
      <Image
        src="/images/backgrounds/fabric-of-squares.png"
        width={1000}
        height={1000}
        alt="square fabric image background"
        className="fixed top-0 left-0 w-full h-screen object-cover z-0"
      />
      <div className="relative max-w-7xl z-10 xl:px-16 lg:px-8 px-4 mx-auto">
        <div className="mb-4 flex justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex flex-col gap-8 items-center w-full">
          <div className="header flex flex-col gap-2 items-center justify-center">
            <Image
              src="/images/logo.svg"
              width={50}
              height={50}
              alt="church of boumerdes logo"
              className="bg-[#fff5]"
            />
            <h1>The Church of Boumerdes</h1>
          </div>
          <Card className="p-0 max-w-3xl w-full gap-0 bg-[#fff7]">
            <CardHeader className="gap-6 px-6 pt-4 border-b border-theme-gold pb-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-base font-medium text-card-foreground">
                  Edit your profile
                </h2>
                <p
                  className={`text-xs font-medium bg-[#fff3] p-2 rounded ${
                    missingFields.length ? "text-red-600" : "text-theme-gold"
                  }`}
                >
                  {missingFields.length
                    ? `* Missing fields: ${missingFields
                        .map((field) => field.label)
                        .join(", ")}`
                    : "* All required fields are complete"}
                </p>
              </div>
            </CardHeader>
            <CardContent className="py-4 px-6">
              <div className="flex sm:flex-row flex-col gap-6">
                <div className="max-w-md w-full md:pe-10 sm:border-e border-theme-gold sm:order-first order-last">
                  <form className="flex flex-col gap-6">
                    <fieldset className="flex flex-col gap-4 *:bg-[#fff5] *:p-2 *:rounded-md disabled:opacity-70">
                      <div className="compulsory bg-transparent!">
                        compulsory fields
                      </div>
                      <Field
                        className={`gap-1.5 ${
                          isFieldMissing("name")
                            ? "rounded-md ring-2 ring-red-300"
                            : ""
                        }`}
                      >
                        <FieldLabel
                          htmlFor="name"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Full Name
                        </FieldLabel>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          required
                          className="dark:bg-background h-9 text-sm shadow-xs text-muted-foreground font-normal"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm">{errors.name}</p>
                        )}
                      </Field>
                      <Field
                        className={`gap-1.5 ${
                          isFieldMissing("email")
                            ? "rounded-md ring-2 ring-red-300"
                            : ""
                        }`}
                      >
                        <FieldLabel
                          htmlFor="email"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Email <i>(currently not editable)</i>
                        </FieldLabel>
                        <Input
                          id="email"
                          type="email"
                          disabled={true}
                          value={formData.email}
                          onChange={(e) =>
                            handleChange("email", e.target.value)
                          }
                          required
                          className="dark:bg-background h-9 text-sm shadow-xs text-muted-foreground font-normal"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm">{errors.email}</p>
                        )}
                      </Field>
                      <Field
                        className={`gap-1.5 ${
                          isFieldMissing("username")
                            ? "rounded-md ring-2 ring-red-300"
                            : ""
                        }`}
                      >
                        <FieldLabel
                          htmlFor="username"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Username (no spaces)
                        </FieldLabel>
                        <Input
                          id="username"
                          type="text"
                          value={formData.username}
                          onChange={(e) =>
                            handleChange(
                              "username",
                              e.target.value.replaceAll(" ", ""),
                            )
                          }
                          required
                          className="dark:bg-background h-9 text-sm shadow-xs text-muted-foreground font-normal"
                        />
                        {errors.username && (
                          <p className="text-red-500 text-sm">
                            {errors.username}
                          </p>
                        )}
                      </Field>
                      <Field
                        className={`gap-1.5 ${
                          isFieldMissing("gender")
                            ? "rounded-md ring-2 ring-red-300"
                            : ""
                        }`}
                      >
                        <FieldLabel
                          htmlFor="gender"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Gender
                        </FieldLabel>
                        <Select
                          value={
                            formData.gender
                              ? formData.gender == "f"
                                ? "female"
                                : "male"
                              : ""
                          }
                          onValueChange={(value) =>
                            handleChange("gender", value)
                          }
                        >
                          <SelectTrigger className="dark:bg-background h-9 text-sm shadow-xs text-muted-foreground font-normal">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="m">Male</SelectItem>
                            <SelectItem value="f">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.gender && (
                          <p className="text-red-500 text-sm">
                            {errors.gender}
                          </p>
                        )}
                      </Field>
                      <Field
                        className={`gap-1.5 ${
                          isFieldMissing("phone")
                            ? "rounded-md ring-2 ring-red-300"
                            : ""
                        }`}
                      >
                        <FieldLabel
                          htmlFor="phone"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Phone (whatsapp)
                        </FieldLabel>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            handleChange("phone", e.target.value)
                          }
                          required
                          className="dark:bg-background h-9 text-sm shadow-xs text-muted-foreground font-normal"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm">{errors.phone}</p>
                        )}
                      </Field>
                      <Field
                        className={`gap-1.5 ${
                          isFieldMissing("passport")
                            ? "rounded-md ring-2 ring-red-300"
                            : ""
                        }`}
                      >
                        <FieldLabel
                          htmlFor="passport"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Passport number
                        </FieldLabel>
                        <Input
                          id="passport"
                          type="text"
                          value={formData.passport}
                          onChange={(e) =>
                            handleChange("passport", e.target.value)
                          }
                          required
                          className="dark:bg-background h-9 text-sm shadow-xs text-muted-foreground font-normal"
                        />
                        {errors.passport && (
                          <p className="text-red-500 text-sm">
                            {errors.passport}
                          </p>
                        )}
                      </Field>
                      <Field
                        className={`gap-1.5 ${
                          isFieldMissing("matricule")
                            ? "rounded-md ring-2 ring-red-300"
                            : ""
                        }`}
                      >
                        <FieldLabel
                          htmlFor="matricule"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Matricule number
                        </FieldLabel>
                        <Input
                          id="matricule"
                          type="text"
                          value={formData.matricule}
                          onChange={(e) =>
                            handleChange("matricule", e.target.value)
                          }
                          required
                          className="dark:bg-background h-9 text-sm shadow-xs text-muted-foreground font-normal"
                        />
                        {errors.matricule && (
                          <p className="text-red-500 text-sm">
                            {errors.matricule}
                          </p>
                        )}
                      </Field>
                      <Field
                        className={`gap-1.5 ${
                          isFieldMissing("country")
                            ? "rounded-md ring-2 ring-red-300"
                            : ""
                        }`}
                      >
                        <FieldLabel
                          htmlFor="country"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Country
                        </FieldLabel>
                        <Select
                          value={formData.country}
                          onValueChange={(value) =>
                            handleChange("country", value)
                          }
                        >
                          <SelectTrigger className="dark:bg-background h-9 text-sm shadow-xs text-muted-foreground font-normal">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="algeria">Algeria</SelectItem>
                            <SelectItem value="france">France</SelectItem>
                            <SelectItem value="usa">USA</SelectItem>
                            {countries.map((country) => {
                              return (
                                <SelectItem
                                  className="capitalize"
                                  key={country}
                                  value={country}
                                >
                                  {country}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {errors.country && (
                          <p className="text-red-500 text-sm">
                            {errors.country}
                          </p>
                        )}
                      </Field>
                      <Field
                        className={`gap-1.5 ${
                          isFieldMissing("language")
                            ? "rounded-md ring-2 ring-red-300"
                            : ""
                        }`}
                      >
                        <FieldLabel
                          htmlFor="language"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Language
                        </FieldLabel>
                        <Select
                          value={formData.language}
                          onValueChange={(value) =>
                            handleChange("language", value)
                          }
                        >
                          <SelectTrigger className="dark:bg-background h-9 text-sm shadow-xs text-muted-foreground font-normal">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="portugais">
                              Portuguese
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.language && (
                          <p className="text-red-500 text-sm">
                            {errors.language}
                          </p>
                        )}
                      </Field>
                      <Field
                        className={`gap-1.5 ${
                          isFieldMissing("algerianId")
                            ? "rounded-md ring-2 ring-red-300"
                            : ""
                        }`}
                      >
                        <FieldLabel
                          htmlFor="algerianId"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Algerian ID (carte de sejour)
                        </FieldLabel>
                        <Input
                          id="algerianId"
                          type="text"
                          value={formData.algerianId}
                          onChange={(e) =>
                            handleChange("algerianId", e.target.value)
                          }
                          required
                          className="dark:bg-background h-9 text-sm shadow-xs text-muted-foreground font-normal"
                        />
                        {errors.algerianId && (
                          <p className="text-red-500 text-sm">
                            {errors.algerianId}
                          </p>
                        )}
                      </Field>
                      <Field
                        className={`gap-1.5 ${
                          isFieldMissing("course")
                            ? "rounded-md ring-2 ring-red-300"
                            : ""
                        }`}
                      >
                        <FieldLabel
                          htmlFor="course"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Course
                        </FieldLabel>
                        <Input
                          id="course"
                          type="text"
                          value={formData.course}
                          onChange={(e) =>
                            handleChange("course", e.target.value)
                          }
                          required
                          className="dark:bg-background h-9 text-sm shadow-xs text-muted-foreground font-normal"
                        />
                        {errors.course && (
                          <p className="text-red-500 text-sm">
                            {errors.course}
                          </p>
                        )}
                      </Field>
                      <Field
                        className={`gap-1.5 ${
                          isFieldMissing("dateOfBirth")
                            ? "rounded-md ring-2 ring-red-300"
                            : ""
                        }`}
                      >
                        <FieldLabel
                          htmlFor="dateOfBirth"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Date of birth
                        </FieldLabel>
                        <div className="scale-90 origin-top-left">
                          <Calendar
                            key={
                              formData.dateOfBirth ? "dob-set" : "dob-empty"
                            }
                            mode="single"
                            selected={
                              formData.dateOfBirth
                                ? new Date(formData.dateOfBirth)
                                : undefined
                            }
                            onSelect={(val) =>
                              handleChange("dateOfBirth", val || "")
                            }
                            captionLayout="dropdown"
                            defaultMonth={
                              formData.dateOfBirth
                                ? new Date(formData.dateOfBirth)
                                : undefined
                            }
                            className="rounded-lg border max-w-80 w-full"
                          />
                        </div>
                        {errors.dateOfBirth && (
                          <p className="text-red-500 text-sm">
                            {errors.dateOfBirth}
                          </p>
                        )}
                      </Field>
                    </fieldset>
                  </form>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                      <h6 className="text-primary text-sm font-medium">
                        User profile
                      </h6>
                      <p className="text-sm text-muted-foreground font-normal leading-6">
                        By submitting this form you agree to our{" "}
                        <button
                          type="button"
                          onClick={() =>
                            setShowPolicyNotice((current) => !current)
                          }
                          className="underline underline-offset-4 text-primary hover:text-primary/80"
                        >
                          privacy policy and terms of use
                        </button>
                        .
                      </p>
                      {showPolicyNotice && (
                        <div className="text-xs text-muted-foreground leading-5 rounded-md border border-theme-gold/25 bg-[#fff4] p-3">
                          <p>
                            Your information is used only for account management
                            and identification in events you attend.
                          </p>
                          <p>
                            Access to your data is restricted to authorized
                            administrators for intended church operations only.
                          </p>
                          <p>
                            Your data is not shared with third parties unless
                            explicitly authorized and released by admins for a
                            valid and approved purpose.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="icon flex w-full items-center justify-center text-theme-gold">
                      {formData.gender == "f" ? (
                        <User2 size={100} />
                      ) : (
                        <User size={100} />
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <h5 className="text-primary text-base font-medium">
                        {formData?.username || user?.name || "---"}
                      </h5>
                      <p className="text-sm text-muted-foreground font-normal">
                        {formData?.email || ""}
                      </p>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount}
                        className="mt-3 text-xs font-medium text-red-600 underline underline-offset-4 transition hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeletingAccount
                          ? "Deleting account..."
                          : "Delete account"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="[.border-t]:pt-5 py-5 px-6 border-t border-border flex sm:flex-row flex-col justify-between sm:items-center items-start gap-5 bg-[#fffa]">
              <p className="text-sm font-normal w-full text-theme-gold">
                Last updated: {formatDate(user?.updatedAt) || "Never"}
              </p>
              <div className="flex gap-3 items-center w-full justify-end">
                <Button
                  variant={"outline"}
                  onClick={cancelEdit}
                  className="rounded-lg cursor-pointer h-9 shadow-xs bg-red-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isUpdating}
                  className="rounded-lg cursor-pointer h-9 hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "updating..." : "Save Changes"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProfileForm;
