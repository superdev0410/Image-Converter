import { MouseEvent, useState } from "react";
import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { useDropzone } from "react-dropzone";

import { FileUploadProps } from "@/client/components/FileUpload/FileUpload.type";
import { uploadFile } from "@/client/utils/api";

const FileUpload = ({onChange}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const onDrop = (acceptedFiels: File[]) => {
    setFiles(acceptedFiels);
  }

  const onUpload = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (files.length > 0) {
        setLoading(true);
        const data = await uploadFile(files);
        onChange(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const {getRootProps, getInputProps} = useDropzone({
    onDrop: onDrop
  });

  return (
    <Flex
      {...getRootProps()}
      direction="column"
      align="center"
      gap="5"
      width="50%"
      className="border-2 border-dashed border-black p-5"
    >
      <Heading>Drag & drop some files here, or click to select files</Heading>
      {
        files.length > 0 &&
        <Text>{files.length > 1 ? `${files.length} files` : files[0].name}</Text>
      }
      <input {...getInputProps()}/>
      <Button onClick={onUpload} loading={loading}>Upload</Button>
    </Flex>
  )
}

export default FileUpload;
