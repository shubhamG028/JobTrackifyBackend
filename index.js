import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { nanoid } from "nanoid";
import ConnectDB from "./database/connect.js";
import UrlModel from "./model/urlModel.js";
import path from "path";
import { fileURLToPath } from "url";
import UAParser from "ua-parser-js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const getGeoLocation = async (ip) => {
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    const data = response.data;
    return {
      country: data.country,
      city: data.city,
      region: data.regionName,
    };
  } catch (error) {
    console.error("Error fetching geolocation:", error);
    return {
      country: "Unknown",
      city: "Unknown",
      region: "Unknown",
    };
  }
};

app.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;
  const shortUrl = nanoid(7);
  const newUrl = new UrlModel({ originalUrl, shortUrl });
  await newUrl.save();
  res.json(newUrl);
});

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/dashboard", async (req, res) => {
  const urls = await UrlModel.find();
  res.json(urls);
});

app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  await UrlModel.findByIdAndDelete(id);
  res.json({ message: "URL deleted" });
});

app.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;
  const url = await UrlModel.findOne({ shortUrl });
  if (url) {
    url.visits += 1;

    const userAgent = req.get("User-Agent");
    const parser = new UAParser(userAgent);
    const device = parser.getResult();

    const ip = req.ip.includes("::") ? process.env.TEST_IP_ADDRESS : req.ip;
    const location = await getGeoLocation(ip);
    const referrer = req.get("Referrer") || "";

    const visitDetail = {
      ipAddress: ip,
      userAgent,
      deviceType: device.device.type || "desktop",
      operatingSystem: `${device.os.name} ${device.os.version}`,
      browser: `${device.browser.name} ${device.browser.version}`,
      location,
      referrer,
    };

    url.visitDetails.push(visitDetail);
    await url.save();
    res.redirect(url.originalUrl);
  } else {
    res.status(404).json("URL not found");
  }
});

const port = process.env.PORT || 5002;
app.listen(port, async () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
  await ConnectDB();
});
