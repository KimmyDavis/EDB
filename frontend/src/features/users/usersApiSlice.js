import { apiSlice } from "../../appState/api/apiSlice";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    queryAdmins: builder.query({
      query: () => ({
        url: `/users?role=admin`,
        method: "GET",
      }),
      keepUnusedDataFor: 5 * 60,
      providesTags: () => [{ type: "Users", id: "ADMINS" }],
    }),
  }),
});

export const { useQueryAdminsQuery } = usersApiSlice;
