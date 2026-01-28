"use client";
import { useEffect } from "react";
import { songsApiSlice } from "@/features/songs/songsApiSlice";
import { useDispatch } from "react-redux";
import store from "@/appState/store";

const Prefetcher = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    store.dispatch(
      songsApiSlice.util.prefetch("querySongs", {}, { force: true })
    );
  }, [dispatch]);
  return null;
};
export default Prefetcher;
