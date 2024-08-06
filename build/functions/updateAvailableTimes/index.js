"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = __importStar(require("@google-cloud/functions-framework"));
const firebase_1 = require("../../firebase");
const cors_1 = __importDefault(require("cors"));
const corsHandler = (0, cors_1.default)({ origin: true });
functions.http("updateAvailableTimes", async (req, res) => {
    corsHandler(req, res, async () => {
        const { doctorId, date, availableTimes } = req.body;
        if (!doctorId || !date || !availableTimes) {
            res.status(400).json({
                msg: "All fields (doctorId, date, availableTimes) are required",
            });
            return;
        }
        try {
            const availabilitySnapshot = await firebase_1.firestore
                .collection("doctors-availabilities")
                .where("doctorId", "==", doctorId)
                .where("date", "==", date)
                .get();
            let docId = firebase_1.firestore.collection("doctors-availabilities").doc().id; // Generate a new ID if none exists
            // Delete existing availability documents
            if (!availabilitySnapshot.empty) {
                docId = availabilitySnapshot.docs[0].id;
                const deletePromises = availabilitySnapshot.docs.map(doc => doc.ref.delete());
                await Promise.all(deletePromises);
            }
            // Add new availability document
            const newAvailability = {
                id: docId,
                doctorId,
                date,
                availableTimes
            };
            await firebase_1.firestore.collection("doctors-availabilities").add(newAvailability);
            res.status(200).json({
                msg: "Availability slot updated successfully",
            });
        }
        catch (error) {
            console.error("Error updating availability: ", error);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    });
});
