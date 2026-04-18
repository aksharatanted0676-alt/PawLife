import mongoose from "mongoose";
import { Pet } from "../models/Pet.js";
import { User } from "../models/User.js";
import { PetConnectRequest } from "../models/PetConnectRequest.js";
import { PetConnectBlock } from "../models/PetConnectBlock.js";
import { PetConnectReport } from "../models/PetConnectReport.js";
import { PetConnectMessage } from "../models/PetConnectMessage.js";
import { HttpError } from "../utils/httpError.js";
import { ok } from "../utils/apiResponse.js";

function toOid(id) {
  try {
    return new mongoose.Types.ObjectId(String(id));
  } catch {
    return null;
  }
}

async function hiddenUserIdsFor(userId) {
  const uid = toOid(userId);
  if (!uid) return new Set();
  const rows = await PetConnectBlock.find({
    $or: [{ blockerUserId: uid }, { blockedUserId: uid }]
  }).lean();
  const out = new Set();
  for (const r of rows) {
    if (r.blockerUserId.equals(uid)) out.add(String(r.blockedUserId));
    if (r.blockedUserId.equals(uid)) out.add(String(r.blockerUserId));
  }
  return out;
}

export async function listConnectRequests(req, res) {
  const me = toOid(req.user.userId);
  if (!me) throw new HttpError(400, "Invalid user");

  const [incoming, outgoing, accepted] = await Promise.all([
    PetConnectRequest.find({ toUserId: me, status: "pending" })
      .sort({ createdAt: -1 })
      .populate("fromPetId", "name breed profileImageUrl petType")
      .populate("toPetId", "name breed profileImageUrl petType")
      .lean(),
    PetConnectRequest.find({ fromUserId: me, status: "pending" })
      .sort({ createdAt: -1 })
      .populate("fromPetId", "name breed profileImageUrl petType")
      .populate("toPetId", "name breed profileImageUrl petType")
      .lean(),
    PetConnectRequest.find({
      status: "accepted",
      $or: [{ fromUserId: me }, { toUserId: me }]
    })
      .sort({ updatedAt: -1 })
      .populate("fromPetId", "name breed profileImageUrl petType")
      .populate("toPetId", "name breed profileImageUrl petType")
      .lean()
  ]);

  return ok(res, { incoming, outgoing, accepted });
}

export async function sendConnectRequest(req, res) {
  const me = toOid(req.user.userId);
  if (!me) throw new HttpError(400, "Invalid user");

  const { fromPetId, toPetId } = req.body || {};
  const fromP = toOid(fromPetId);
  const toP = toOid(toPetId);
  if (!fromP || !toP) throw new HttpError(400, "fromPetId and toPetId required");

  const fromPet = await Pet.findOne({ _id: fromP, userId: me });
  if (!fromPet) throw new HttpError(404, "Your pet not found");

  const toPet = await Pet.findById(toP);
  if (!toPet) throw new HttpError(404, "Target pet not found");
  if (toPet.userId.equals(me)) throw new HttpError(400, "Cannot connect to your own pet");

  const hidden = await hiddenUserIdsFor(req.user.userId);
  if (hidden.has(String(toPet.userId))) throw new HttpError(403, "Blocked");

  const dup = await PetConnectRequest.findOne({
    fromUserId: me,
    toUserId: toPet.userId,
    fromPetId: fromP,
    toPetId: toP,
    status: "pending"
  });
  if (dup) throw new HttpError(409, "Request already pending");

  const created = await PetConnectRequest.create({
    fromUserId: me,
    toUserId: toPet.userId,
    fromPetId: fromP,
    toPetId: toP,
    status: "pending"
  });

  const populated = await PetConnectRequest.findById(created._id)
    .populate("fromPetId", "name breed profileImageUrl petType")
    .populate("toPetId", "name breed profileImageUrl petType")
    .lean();

  return ok(res, { request: populated }, "Request sent", 201);
}

export async function acceptConnectRequest(req, res) {
  const me = toOid(req.user.userId);
  const id = toOid(req.params.id);
  if (!me || !id) throw new HttpError(400, "Invalid id");

  const doc = await PetConnectRequest.findOne({ _id: id, toUserId: me, status: "pending" });
  if (!doc) throw new HttpError(404, "Request not found");

  doc.status = "accepted";
  await doc.save();

  const populated = await PetConnectRequest.findById(doc._id)
    .populate("fromPetId", "name breed profileImageUrl petType")
    .populate("toPetId", "name breed profileImageUrl petType")
    .lean();

  return ok(res, { request: populated }, "Request accepted");
}

export async function rejectConnectRequest(req, res) {
  const me = toOid(req.user.userId);
  const id = toOid(req.params.id);
  if (!me || !id) throw new HttpError(400, "Invalid id");

  const doc = await PetConnectRequest.findOne({ _id: id, toUserId: me, status: "pending" });
  if (!doc) throw new HttpError(404, "Request not found");

  doc.status = "rejected";
  await doc.save();
  return ok(res, { success: true }, "Request rejected");
}

export async function blockUser(req, res) {
  const me = toOid(req.user.userId);
  const { userId: blockedRaw } = req.body || {};
  const blocked = toOid(blockedRaw);
  if (!me || !blocked) throw new HttpError(400, "userId required");
  if (blocked.equals(me)) throw new HttpError(400, "Invalid");

  await PetConnectBlock.findOneAndUpdate(
    { blockerUserId: me, blockedUserId: blocked },
    { blockerUserId: me, blockedUserId: blocked },
    { upsert: true, new: true }
  );

  await PetConnectRequest.updateMany(
    {
      status: "pending",
      $or: [
        { fromUserId: me, toUserId: blocked },
        { fromUserId: blocked, toUserId: me }
      ]
    },
    { status: "rejected" }
  );

  return ok(res, { success: true }, "User blocked");
}

export async function reportUser(req, res) {
  const me = toOid(req.user.userId);
  const { userId: reportedRaw, reason, targetPetId } = req.body || {};
  const reported = toOid(reportedRaw);
  if (!me || !reported) throw new HttpError(400, "userId required");
  if (!reason || !String(reason).trim()) throw new HttpError(400, "reason required");
  if (reported.equals(me)) throw new HttpError(400, "Invalid");

  const petOid = targetPetId ? toOid(targetPetId) : undefined;
  await PetConnectReport.create({
    reporterUserId: me,
    reportedUserId: reported,
    targetPetId: petOid || undefined,
    reason: String(reason).trim()
  });

  return ok(res, { success: true }, "Report submitted", 201);
}

export async function listMessages(req, res) {
  const me = toOid(req.user.userId);
  const connId = toOid(req.params.connectionId);
  if (!me || !connId) throw new HttpError(400, "Invalid connection");

  const conn = await PetConnectRequest.findOne({
    _id: connId,
    status: "accepted",
    $or: [{ fromUserId: me }, { toUserId: me }]
  });
  if (!conn) throw new HttpError(404, "Connection not found");

  const messages = await PetConnectMessage.find({ connectionId: connId }).sort({ createdAt: 1 }).limit(200).lean();
  return ok(res, { messages });
}

export async function postMessage(req, res) {
  const me = toOid(req.user.userId);
  const { connectionId, body: text } = req.body || {};
  const connId = toOid(connectionId);
  if (!me || !connId) throw new HttpError(400, "connectionId required");
  if (!text || !String(text).trim()) throw new HttpError(400, "body required");

  const conn = await PetConnectRequest.findOne({
    _id: connId,
    status: "accepted",
    $or: [{ fromUserId: me }, { toUserId: me }]
  });
  if (!conn) throw new HttpError(404, "Connection not found");

  const msg = await PetConnectMessage.create({
    connectionId: connId,
    senderUserId: me,
    body: String(text).trim()
  });

  return ok(res, { message: msg.toObject() }, "Message sent", 201);
}

export async function verifyAccountDemo(req, res) {
  const me = toOid(req.user.userId);
  if (!me) throw new HttpError(400, "Invalid user");
  await User.updateOne({ _id: me }, { $set: { petConnectAccountVerified: true } });
  return ok(res, { success: true }, "Verified");
}
