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
} = eventsApiSlice;
