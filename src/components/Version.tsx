import React from "react";
import { config } from "../config";

interface VersionProps {
  className?: string;
  showLabel?: boolean;
}

const Version: React.FC<VersionProps> = ({
  className = "text-xs text-gray-500",
  showLabel = true,
}) => {
  return (
    <div className={className}>
      {showLabel && <span>Versión: </span>}
      {config.appVersion}
    </div>
  );
};

export default Version;
