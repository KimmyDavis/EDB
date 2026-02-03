import { apiSlice } from "../../appState/api/apiSlice";

export const massApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    queryMass: builder.query({
      query: ({ id, date, title, code }) => ({
        url: `/mass?id=${id || ""}&date=${date || ""}&title=${
          title || ""
        }&code=${code || ""}`,
        method: "GET",
      }),
      keepUnusedDataFor: 24 * 60 * 60,
      providesTags: () => [{ type: "Mass", id: "MASS_LIST" }],
    }),
    createMass: builder.mutation({
      query: (massData) => ({
        url: "/mass",
        method: "POST",
        body: { ...massData },
      }),
      invalidatesTags: () => [{ type: "Mass", id: "MASS_LIST" }],
    }),
    editMass: builder.mutation({
      query: (massData) => ({
        url: "/mass",
        method: "PATCH",
        body: { ...massData },
      }),
      invalidatesTags: () => [{ type: "Mass", id: "MASS_LIST" }],
    }),
  }),
});

// 1. Create a "base" selector for the specific query + arguments
const selectMassData = massApiSlice.endpoints.queryMass.select({});

// 2. (Optional) Create a memoized selector for just the 'data' field
import { createSelector } from "@reduxjs/toolkit";

export const selectAllMass = createSelector(
  selectMassData,
  (massResult) => massResult.data ?? [] // Returns the transformed data or empty array
);

export const { useCreateMassMutation, useQueryMassQuery, useEditMassMutation } =
  massApiSlice;
