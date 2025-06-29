import { useEffect } from "react";
import { config } from "../config";

export const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    const fullTitle = title ? `${title} - ${config.appName}` : config.appName;
    document.title = fullTitle;
  }, [title]);
};

export default useDocumentTitle;
