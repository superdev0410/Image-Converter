import { ChangeEvent, useState } from "react";
import { DataList, Flex, Table, TextField, Button, Select } from "@radix-ui/themes";

import { FileUpload } from "@/client/components";
import { ImageInfo } from "@/client/utils/type";
import { 
  changeType,
  downloadMultipleFiles,
  downloadSingleFile,
  resizeImage
} from "@/client/utils/api";

const App = () => {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(300);
  const [format, setFormat] = useState("png");

  const onChangeWidth = (e: ChangeEvent<HTMLInputElement>) => 
    setWidth(Number(e.target.value));
  const onChangeHeight = (e: ChangeEvent<HTMLInputElement>) => 
    setHeight(Number(e.target.value));

  const onResize = async () => {
    try {
      await resizeImage(images.map((image) => image.name), width, height);
      setImages(images.map((image) => ({...image, width: width, height: height})));
    } catch (error) {
      console.error(error);
    }
  }

  const onConvert = async () => {
    try {
      await changeType(images.map((image) => image.name), format);
      setImages(images.map((image) => ({
        ...image,
        name: `${image.name.split(".")[0]}.${format}`,
        type: format
      })));
    } catch (error) {
      console.error(error);
    }
  }

  const onDownload = async () => {
    if (images.length > 1) {
      await downloadMultipleFiles(images.map((image) => image.name));
    } else {
      await downloadSingleFile(images[0].name);
    }
  }

  return (
    <Flex direction="column" gap="5" className="p-5">
      <FileUpload onChange={setImages}/>

      {
        images.length > 0 &&
        <>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Width</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Height</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              images.map((image) => (
                <Table.Row>
                  <Table.Cell>{image.name}</Table.Cell>
                  <Table.Cell>{image.width}</Table.Cell>
                  <Table.Cell>{image.height}</Table.Cell>
                  <Table.Cell>{image.type}</Table.Cell>
                </Table.Row>
              ))
            }
          </Table.Body>
        </Table.Root>

        <Flex direction="column" gap="3">
          <DataList.Root>
            <DataList.Item>
              <DataList.Label>Width:</DataList.Label>
              <DataList.Value>
                <TextField.Root type='number' value={width} onChange={onChangeWidth} />
              </DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label>Height:</DataList.Label>
              <DataList.Value>
                <TextField.Root type='number' value={height} onChange={onChangeHeight} />
              </DataList.Value>
            </DataList.Item>

            <Button onClick={onResize}>Reisze</Button>
          </DataList.Root>


          <DataList.Root>
            <DataList.Item>
              <DataList.Label>Format:</DataList.Label>
              <DataList.Value>
                <Select.Root value={format} onValueChange={setFormat}>
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="png">png</Select.Item>
                    <Select.Item value="jpg">jpg</Select.Item>
                  </Select.Content>
                </Select.Root>
              </DataList.Value>
            </DataList.Item>

            <Button onClick={onConvert}>Convert</Button>
          </DataList.Root>

          <Button className="w-fit" onClick={onDownload}>Download</Button>
        </Flex>
        </>
      }
    </Flex>
  );
};

export default App;
