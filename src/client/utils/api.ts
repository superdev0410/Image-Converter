import axios from "axios";

import { download } from "@/client/utils/helper";

export const uploadFile = async (files: File[]) => {
  const data = new FormData();
  files.forEach((file) => {
    data.append("files", file);
  });
  const res = await axios.post("/api/upload", data, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return res.data;
}

export const downloadSingleFile = async (name: string) => {
  const res = await axios.get(`/api/download/${name}`, { responseType: "blob" });
  download(name, new Blob([res.data]));
}

export const downloadMultipleFiles = async (names: string[]) => {
  const res = await axios.post(`/api/download`, { files: names });
  const dataArray = new Uint8Array(res.data.data);
  download("images.zip", new Blob([dataArray]));
}

export const resizeImage = async (files: string[], width: number, height: number) => {
  await axios.post(`/api/resize`, { width, height, files });
}

export const changeType = async (files: string[], type: string) => {
  await axios.post(`/api/convert/${type}`, { files });
}