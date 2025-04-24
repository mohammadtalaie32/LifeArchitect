import { useContext } from "react";
import { UserContext } from "@/App";

export function useUser() {
  const context = useContext(UserContext);
  return context;
}
