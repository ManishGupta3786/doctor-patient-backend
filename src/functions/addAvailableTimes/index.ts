import * as functions from "@google-cloud/functions-framework";
import { Request, Response } from "express";
import { firestore } from "../../firebase";
import { DoctorsAvailability } from "../../interfaces/doctors-availability.interface";
const faker_1 = require("@faker-js/faker");
import cors from "cors";

const corsHandler = cors({ origin: true });

functions.http("addAvailableTimes", async (req: Request, res: Response) => {
  
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
      

      if (!availabilitySnapshot.empty) {
        res.status(404).json({
          msg: "You have already added a slot for the given date. You can update it",
        });
        return;
      }
      

      const Availabilities : DoctorsAvailability = {
        id: faker_1.faker.string.uuid(),
        doctorId,
        date,
        availableTimes
      };
      
      await firestore.collection("doctors-availabilities").add(Availabilities);

      res.status(200).json({
        msg: "Availability slot added successfully"
      });
    } catch (error) {
      res.status(500).json({ msg: "Internal Server Error" });
    }
  });
});
