import { Router, Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import JSZip from "jszip";
import sharp, { FormatEnum } from "sharp";

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

apiRouter.post("/upload", upload.array("files"), async (_: Request, res: Response) => {
  res.sendStatus(200);
});

apiRouter.get("/download/:file", async (req: Request, res: Response) => {
  const { file } = req.params;
  res.download(`./files/${file}`);
});

apiRouter.post("/download", async (req: Request, res: Response) => {
  const [ files ] = req.body;
  const zip = new JSZip();
  files.forEach((file: string) => {
    const data = fs.readFileSync(`./files/${file}`);
    zip.file(file, data);
  });
  const zipped = await zip.generateAsync({ type: "nodebuffer" });
  res.json(zipped);
});

apiRouter.post("/resize/:file", async (req: Request, res: Response) => {
  const [width, height] = req.body;
  const { file } = req.params;
  sharp(file).resize(width, height).toBuffer((err, buffer) => {
    if (err) {
      res.status(500).send(err);
    } else {
      fs.writeFileSync(file, buffer);
      res.sendStatus(200);
    }
  });
});

apiRouter.post("/convert/:file/:type", async (req: Request, res: Response) => {
  const { file, type } = req.params;
  
  sharp(file).toFormat(type as keyof FormatEnum).toBuffer((err, buffer) => {
    if (err) {
      res.status(500).send(err);
    } else {
      fs.rmSync(file);
      fs.writeFileSync(file.split(".")[0] + `.${type}`, buffer);
      res.sendStatus(200);
    }
  });
});

export default apiRouter;