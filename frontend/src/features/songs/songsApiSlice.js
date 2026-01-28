import { apiSlice } from "../../appState/api/apiSlice";

export const songsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    querySongs: builder.query({
      query: ({ id, service, section, category, title, code }) => ({
        url: `/songs?id=${id || ""}&service=${service || ""}&section=${
          section || ""
        }&category=${category || ""}&title=${title || ""}&code=${code || ""}`,
        method: "GET",
      }),
      keepUnusedDataFor: 3 * 60 * 60,
      providesTags: () => [{ type: "Songs", id: "LIST" }],
    }),
    createSong: builder.mutation({
      query: (songData) => ({
        url: "/songs",
        method: "POST",
        body: { ...songData },
      }),
      invalidatesTags: () => [{ type: "Songs", id: "LIST" }],
    }),
    editSong: builder.mutation({
      query: (songData) => ({
        url: "/songs",
        method: "PATCH",
        body: { ...songData },
      }),
      invalidatesTags: () => [{ type: "Songs", id: "LIST" }],
    }),
  }),
});

// 1. Create a "base" selector for the specific query + arguments
const selectSongsData = songsApiSlice.endpoints.querySongs.select({});

// 2. (Optional) Create a memoized selector for just the 'data' field
import { createSelector } from "@reduxjs/toolkit";

export const selectAllSongs = createSelector(
  selectSongsData,
  (songsResult) => songsResult.data ?? [] // Returns the transformed data or empty array
);

export const { useCreateSongMutation, useQuerySongsQuery, useEditSongMutation } = songsApiSlice;
