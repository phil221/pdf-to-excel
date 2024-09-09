"use client";

import convert from "@/utils/convert";
import { useState } from "react";

type File = {
  name: string;
  size: number;
  type: string;
};

const FileUploader = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
          convert(data as string);
        }
      };
    }
  };
  return <input type="file" onChange={handleOnChange} />;
};

export default FileUploader;
