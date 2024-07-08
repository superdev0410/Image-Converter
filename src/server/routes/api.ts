import { Router, Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import JSZip from "jszip";
import sharp from "sharp";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync("./files", { recursive: true});
    cb(null, "./files");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

const apiRouter = Router();

apiRouter.post("/upload", upload.array("files"), async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const result = [];
  for (let i = 0; i < files.length; i++) {
    const metaData = await sharp(`./files/${files[i].originalname}`).metadata();
    result.push({
      "name": files[i].originalname,
      "width": metaData.width,
      "height": metaData.height,
      "type": metaData.format
    });
  }
  res.json(result);
});

apiRouter.get("/download/:file", async (req: Request, res: Response) => {
  const { file } = req.params;
  res.download(`./files/${file}`);
});

apiRouter.post("/download", async (req: Request, res: Response) => {
  const { files } = req.body;
  const zip = new JSZip();
  files.forEach((file: string) => {
    const data = fs.readFileSync(`./files/${file}`);
    zip.file(file, data);
  });
  const zipped = await zip.generateAsync({ type: "nodebuffer" });
  res.json(zipped);
});

apiRouter.post("/resize", async (req: Request, res: Response) => {
  try {
    const {width, height, files} = req.body;
    await Promise.all(files.map(async (file: string) => {
      const buffer = fs.readFileSync(`./files/${file}`);
      await sharp(buffer)
        .resize({ width: width, height: height, fit: sharp.fit.fill })
        .toFile(`./files/${file}`);
    }));
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

apiRouter.post("/convert/:type", async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { files } = req.body;

    await Promise.all(files.map(async (file: string) => {
      const buffer = await sharp(`./files/${file}`)
        .toFormat(type as keyof sharp.FormatEnum)
        .toBuffer();
      fs.rmSync(`./files/${file}`);
      fs.writeFileSync(`./files/${file.split(".")[0]}.${type}`, buffer);
    }));
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default apiRouter;