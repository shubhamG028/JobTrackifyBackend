import mongoose from "mongoose";

const urlSchema = new mongoose.Schema(
  {
    originalUrl: { type: String, required: true },
    shortUrl: { type: String },
    visits: { type: Number, default: 0 },
    visitDetails: [
      {
        ipAddress: String,
        userAgent: String,
        deviceType: String,
        operatingSystem: String,
        browser: String,
        location: {
          country: String,
          city: String,
          region: String,
        },
        referrer: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const urlModel = mongoose.model("Url", urlSchema);

export default urlModel;
