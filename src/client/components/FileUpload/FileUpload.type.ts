import { ImageInfo } from "@/client/utils/type"

export interface FileUploadProps {
  onChange: (images: ImageInfo[]) => void;
}
