import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import stream from "stream";
import { promisify } from "util";

const pipeline = promisify(stream.pipeline);
const s3 = new S3Client({ region: process.env.AWS_REGION });

// Define the Mongoose schema
const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  case: { type: mongoose.Schema.Types.ObjectId, ref: "Case" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileKey: { type: String },     // S3 object key
  storage: { type: String },     // e.g. "s3"
  mimeType: { type: String },
  status: { type: String, default: "pending" },  // pending, processing, ready, failed
  error: { type: String },
  generatedAt: { type: Date },
}, {
  timestamps: true,
});

// Create the Mongoose model
const Report = mongoose.model("Report", reportSchema);

// Async worker function to process the report job
export async function processReportJob(job) {
  const { reportId } = job.data;

  const report = await Report.findById(reportId);
  if (!report) throw new Error("Report not found");

  try {
    report.status = "processing";
    await report.save();

    // Create PDF document
    const pdfStream = new PDFDocument();
    pdfStream.fontSize(14).text(report.title);
    pdfStream.moveDown();
    pdfStream.text("Generated: " + new Date().toISOString());
    // TODO: add real content from DB or job data

    pdfStream.end();

    // Stream PDF to S3 using PassThrough stream
    const pass = new stream.PassThrough();
    const uploadKey = `reports/${report.user.toString()}/${report._id}.pdf`;

    const uploadPromise = s3.send(new PutObjectCommand({
      Bucket: process.env.REPORTS_BUCKET,
      Key: uploadKey,
      Body: pass,
      ContentType: "application/pdf",
    }));

    await pipeline(pdfStream, pass);
    await uploadPromise;

    report.fileKey = uploadKey;
    report.storage = "s3";
    report.mimeType = "application/pdf";
    report.status = "ready";
    report.generatedAt = new Date();
    await report.save();
  } catch (err) {
    console.error("Report worker error:", err);
    report.status = "failed";
    report.error = String(err);
    await report.save();
    throw err;
  }
}

export default Report;
