const { PDFParse } = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function extractPdfText(buffer) {
    const parser = new PDFParse({ data: buffer });

    try {
        const pdfData = await parser.getText();
        return pdfData.text?.trim() || "";
    } finally {
        await parser.destroy();
    }
}

/**
 * @description Generate interview report based on PDF resume and descriptions.
 */
async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body;

        if (!jobDescription) {
            return res.status(400).json({ message: "Job description is required." });
        }

        if (!req.file && !selfDescription) {
            return res.status(400).json({ message: "Resume ya self description me se ek required hai." });
        }

        let resumeText = "";

        if (req.file) {
            try {
                resumeText = await extractPdfText(req.file.buffer);
            } catch (error) {
                console.error("PDF parsing error:", error);
                return res.status(400).json({
                    message: "Uploaded PDF ko read nahi kiya ja saka. Please text-based PDF upload karein."
                });
            }

            if (!resumeText) {
                return res.status(400).json({
                    message: "PDF me readable text nahi mila. Please text-based PDF upload karein."
                });
            }
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription,
            ...interViewReportByAi
        });

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });

    } catch (err) {
        console.error("Internal Error:", err);
        res.status(500).json({ message: "Server error during processing", error: err.message });
    }
}


/**
 * @description Get interview report by ID
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;
        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id });

        if (!interviewReport) {
            return res.status(404).json({ message: "Report nahi mili." });
        }

        res.status(200).json({ message: "Fetched successfully.", interviewReport });
    } catch (err) {
        res.status(500).json({ message: "Error fetching report" });
    }
}

/** * @description Get all reports for logged in user
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

        res.status(200).json({ message: "All reports fetched.", interviewReports });
    } catch (err) {
        res.status(500).json({ message: "Error fetching reports" });
    }
}

/**
 * @description Generate/Download resume PDF
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;
        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;
        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        });

        res.send(pdfBuffer);
    } catch (err) {
        console.error("Resume PDF generation error:", err);
        res.status(500).json({ message: err.message || "PDF generation failed." });
    }
}

module.exports = { 
    generateInterViewReportController, 
    getInterviewReportByIdController, 
    getAllInterviewReportsController, 
    generateResumePdfController 
};
