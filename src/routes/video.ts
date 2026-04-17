import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createRoom,
  getRoom,
  getRooms,
  endRoom,
  saveMessage,
  getMessages,
  joinViaToken,
} from "../controllers/video.js";

const videoRouter = express.Router();

videoRouter.post("/rooms", createRoom);
videoRouter.get("/rooms", getRooms);

videoRouter.get("/rooms/:id", getRoom);
videoRouter.post("/rooms/:id/end", endRoom);

videoRouter.post("/rooms/:roomId/messages", saveMessage);
videoRouter.get("/rooms/:roomId/messages", getMessages);

videoRouter.get("/join/:token", joinViaToken);

export default videoRouter;