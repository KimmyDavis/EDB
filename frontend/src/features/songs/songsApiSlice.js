import { apiSlice } from "../../appState/api/apiSlice";

export const songsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    querySongs: builder.query({
      query: (songQuery) => ({
        url: "/songs",
        method: "GET",
      }),
    }),
    createSong: builder.mutation({
      query: (songData) => ({
        url: "/songs",
        method: "POST",
        body: { ...songData },
      }),
    }),
  }),
});

export const { useCreateSongMutation, useQuerySongsQuery } = songsApiSlice;
