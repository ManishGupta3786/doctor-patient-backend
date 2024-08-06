import * as functions from "@google-cloud/functions-framework";
import { Request, Response } from "express";
import { firestore } from "../../firebase";
import { DoctorsAvailability, TimeSlot } from "../../interfaces/doctors-availability.interface";
import cors from "cors";

const corsHandler = cors({ origin: true });

functions.http("updateAvailableTimes", async (req: Request, res: Response) => {
  corsHandler(req, res, async () => {
    const { doctorId, date, availableTimes } = req.body;

    if (!doctorId || !date || !availableTimes) {
      res.status(400).json({
        msg: "All fields (doctorId, date, availableTimes) are required",
      });
      return;
    }

    try {
      const availabilitySnapshot = await firestore
        .collection("doctors-availabilities")
        .where("doctorId", "==", doctorId)
        .where("date", "==", date)
        .get();

      let docId = firestore.collection("doctors-availabilities").doc().id; // Generate a new ID if none exists

      // Delete existing availability documents
      if (!availabilitySnapshot.empty) {
        docId = availabilitySnapshot.docs[0].id;
        const deletePromises = availabilitySnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
      }

      
      // Add new availability document
      const newAvailability: DoctorsAvailability = {
        id: docId,
        doctorId,
        date,
        availableTimes
      };

      await firestore.collection("doctors-availabilities").add(newAvailability);

      res.status(200).json({
        msg: "Availability slot updated successfully",
      });
    } catch (error) {
      console.error("Error updating availability: ", error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  });
});