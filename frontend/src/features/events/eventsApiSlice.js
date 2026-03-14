import { apiSlice } from "../../appState/api/apiSlice";

export const eventsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    queryEvents: builder.query({
      query: ({
        eventId,
        title,
        startDate,
        endDate,
        date,
        venue,
        code,
        theme,
        populateUsers,
      }) => ({
        url: `/events?eventId=${eventId || ""}&title=${title || ""}&startDate=${
          startDate || ""
        }&endDate=${endDate || ""}&date=${date || ""}&venue=${venue || ""}&code=${
          code || ""
        }&theme=${theme || ""}&populateUsers=${populateUsers || ""}`,
        method: "GET",
      }),
      keepUnusedDataFor: 3 * 60 * 60,
      providesTags: () => [{ type: "Events", id: "LIST" }],
    }),
    createEvent: builder.mutation({
      query: (eventData) => ({
        url: "/events",
        method: "POST",
        body: { ...eventData },
      }),
      invalidatesTags: () => [{ type: "Events", id: "LIST" }],
    }),
    updateEvent: builder.mutation({
      query: ({ ...eventData }) => ({
        url: `/events`,
        method: "PATCH",
        body: { ...eventData },
      }),
      invalidatesTags: () => [{ type: "Events", id: "LIST" }],
    }),
    joinOrLeaveEvent: builder.mutation({
      query: ({ eventId, userId, action }) => ({
        url: `/events/joinOrLeave`,
        method: "PATCH",
        body: { eventId, userId, action },
      }),
      invalidatesTags: () => [{ type: "Events", id: "LIST" }],
    }),
    deleteEvent: builder.mutation({
      query: ({ id }) => ({
        url: `/events/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: () => [{ type: "Events", id: "LIST" }],
    }),
    downloadEventParticipantsPdf: builder.mutation({
      query: ({ eventId, fields }) => ({
        url: "/events/participants/pdf",
        method: "POST",
        body: { eventId, fields },
        responseHandler: async (response) => ({
          blob: await response.blob(),
          disposition: response.headers.get("content-disposition") || "",
        }),
      }),
      transformResponse: (response) => {
        const now = new Date();
        const timestamp =
          [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, "0"),
            String(now.getDate()).padStart(2, "0"),
          ].join("") +
          "-" +
          [
            String(now.getHours()).padStart(2, "0"),
            String(now.getMinutes()).padStart(2, "0"),
            String(now.getSeconds()).padStart(2, "0"),
          ].join("");
        const fallbackName = `participants-${timestamp}.pdf`;
        const match = response?.disposition?.match(
          /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i,
        );
        const rawFileName = match?.[1] || match?.[2] || fallbackName;
        const fileName = decodeURIComponent(rawFileName);
        const fileUrl =
          typeof window !== "undefined" && response?.blob
            ? window.URL.createObjectURL(response.blob)
            : "";

        return {
          fileUrl,
          fileName,
        };
      },
    }),
  }),
});

// 1. Create a "base" selector for the specific query + arguments
const selectEventsData = eventsApiSlice.endpoints.queryEvents.select({});

// 2. (Optional) Create a memoized selector for just the 'data' field
import { createSelector } from "@reduxjs/toolkit";

export const selectAllEvents = createSelector(
  selectEventsData,
  (eventsResult) => {
    let eventsData = {};
    eventsData["data"] = eventsResult?.data;
    eventsData["isError"] = eventsResult?.isError;
    eventsData["isLoading"] = eventsResult?.isLoading;
    eventsData["error"] = eventsResult?.error;
    return eventsData;
  }, // Returns the transformed data or empty array
);

export const {
  useQueryEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useJoinOrLeaveEventMutation,
  useDeleteEventMutation,
  useDownloadEventParticipantsPdfMutation,
} = eventsApiSlice;
