"use client";

import { useEffect, useState } from "react";

const useAuth = () => {
  const [isEditor, setIsEditor] = useState(false);
  useEffect(() => {
    const isEditor = JSON.parse(localStorage.getItem("isEditor")) || false;
    setIsEditor(isEditor);
  }, []);
  return {
    isEditor,
  };
};
export default useAuth;
