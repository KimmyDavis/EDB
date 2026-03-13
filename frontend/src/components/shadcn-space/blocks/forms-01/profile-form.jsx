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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/authClient";
import { User } from "lucide-react";
import { User2 } from "lucide-react";
import { PersonStanding } from "lucide-react";
import { Magnet } from "lucide-react";
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
  const { session, user } = data || {};

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
    birthdate: "",
    course: "",
    language: "",
    gender: "",
  });

  const [errors, setErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

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
      birthdate,
      course,
      language,
      gender,
    } = user || {};

    setFormData({
      name: name || "",
      email: email || "",
      username: username || "",
      phone: phone || "",
      matricule: matricule || "",
      passport: passport || "",
      algerianId: algerianId || "",
      country: country || "",
      birthdate: birthdate || "",
      course: course || "",
      language: language || "",
      gender: gender || "",
    });
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    Validator.register(
      "ddmm",
      function (value) {
        const parts = value.split("/");

        if (parts.length !== 2) return false;

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);

        if (isNaN(day) || isNaN(month)) return false;
        if (month < 1 || month > 12) return false;

        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        return day >= 1 && day <= daysInMonth[month - 1];
      },
      "The :attribute must be a valid date in dd/mm format.",
    );

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
      birthdate: "required|ddmm",
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
      formData.matricule &&
      formData.passport &&
      formData.algerianId &&
      formData.country &&
      formData.birthdate &&
      formData.course &&
      formData.language &&
      formData.gender &&
      !Object.values(errors).some(Boolean)
    );
  };

  const handleSubmit = async (e) => {
    setIsUpdating(true);
    e.preventDefault();

    console.log(Object.values(errors), formData);

    if (!isFormValid()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { data } = await authClient.updateUser({
        name: formData.name,
        username: formData.username,
        phone: formData.phone,
        matricule: formData.matricule.toLocaleLowerCase(),
        passport: formData.passport,
        algerianId: formData.algerianId,
        country: formData.country,
        birthdate: formData.birthdate,
        course: formData.course,
        language: formData.language,
        gender: formData.gender,
      });
      console.log(data);
      if (data?.status) {
        toast.success("Profile updated successfully!");
        router.push("/home");
      }
    } catch (error) {
      toast.error("Failed to update profile: " + error.message);
    }
    setIsUpdating(false);
  };

  return (
    <section className="py-8 sm:py-16 lg:py-20 bg-theme-cream">
      <div className="max-w-7xl xl:px-16 lg:px-8 px-4 mx-auto">
        <div className="flex flex-col gap-8 items-center w-full">
          <div className="header flex flex-col gap-2 items-center justify-center">
            <Image
              src="/images/logo.svg"
              width={50}
              height={50}
              alt="church of boumerdes logo"
              className="bg-[#0001]"
            />
            <h1>The Church of Boumerdes</h1>
          </div>
          <Card className="p-0 max-w-3xl w-full gap-0 bg-[#fff7]">
            <CardHeader className="gap-6 px-6 pt-4 border-b border-theme-gold pb-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-base font-medium text-card-foreground">
                  Edit your profile
                </h2>
                <p className="text-xs text-theme-gold font-medium bg-[#fff3] p-2 rounded">
                  * All fields are required
                </p>
              </div>
            </CardHeader>
            <CardContent className="py-4 px-6">
              <div className="flex sm:flex-row flex-col gap-6">
                <div className="max-w-md w-full md:pe-10 sm:border-e border-theme-gold sm:order-first order-last">
                  <form className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 *:bg-[#fff5] *:p-2 *:rounded-md">
                      <Field className="gap-1.5">
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
                      <Field className="gap-1.5">
                        <FieldLabel
                          htmlFor="email"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Email
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
                      <Field className="gap-1.5">
                        <FieldLabel
                          htmlFor="username"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Username
                        </FieldLabel>
                        <Input
                          id="username"
                          type="text"
                          value={formData.username}
                          onChange={(e) =>
                            handleChange("username", e.target.value)
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
                      <Field className="gap-1.5">
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
                      <Field className="gap-1.5">
                        <FieldLabel
                          htmlFor="phone"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Phone
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
                      <Field className="gap-1.5">
                        <FieldLabel
                          htmlFor="matricule"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Matricule
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
                      <Field className="gap-1.5">
                        <FieldLabel
                          htmlFor="passport"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Passport
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
                      <Field className="gap-1.5">
                        <FieldLabel
                          htmlFor="algerianId"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Algerian ID
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
                      <Field className="gap-1.5">
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
                      <Field className="gap-1.5">
                        <FieldLabel
                          htmlFor="birthdate"
                          className="text-sm text-muted-foreground font-normal"
                        >
                          Birthdate
                        </FieldLabel>
                        <Input
                          id="birthdate"
                          type="text"
                          value={formData.birthdate}
                          placeholder="dd/mm"
                          onChange={(e) =>
                            handleChange("birthdate", e.target.value)
                          }
                          required
                          className="dark:bg-background h-9 text-sm shadow-xs text-muted-foreground font-normal"
                        />
                        {errors.birthdate && (
                          <p className="text-red-500 text-sm">
                            {errors.birthdate}
                          </p>
                        )}
                      </Field>
                      <Field className="gap-1.5">
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
                      <Field className="gap-1.5">
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
                            <SelectItem value="portugais">Portugais</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.language && (
                          <p className="text-red-500 text-sm">
                            {errors.language}
                          </p>
                        )}
                      </Field>
                    </div>
                  </form>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                      <h6 className="text-primary text-sm font-medium">
                        User profile
                      </h6>
                      <p className="text-sm text-muted-foreground font-normal">
                        By submitting this form you agree to the terms of use.
                      </p>
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
                  onClick={() => router.push("/home")}
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
