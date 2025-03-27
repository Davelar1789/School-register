import { useContext } from "react";
import { UserContext } from "./userContextProvider";

export const useUserContext = () => {
  const userContext = useContext(UserContext);

  if (userContext === null) {
    throw new Error("User Context must be used within a User Context Provider");
  }

  return userContext;
};
