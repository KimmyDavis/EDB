export const REQUIRED_PROFILE_INFO_FIELDS = [
  "phone",
  "matricule",
  "passport",
  "algerianId",
  "country",
  "birthdate",
  "course",
  "language",
  "gender",
];

export const hasRequiredProfileInfo = (user = {}) => {
  return REQUIRED_PROFILE_INFO_FIELDS.every((field) => Boolean(user?.[field]));
};
