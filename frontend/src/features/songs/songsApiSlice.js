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
