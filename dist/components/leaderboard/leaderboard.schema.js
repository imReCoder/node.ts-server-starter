"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderBoard = void 0;
const mongoose_1 = require("mongoose");
const leaderBoardSchema = new mongoose_1.Schema({
    roomId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'QuizRoom', required: true },
    result: {},
    last_count: { type: Number, required: true }
});
exports.LeaderBoard = mongoose_1.model('LeaderBoard', leaderBoardSchema);
//# sourceMappingURL=leaderboard.schema.js.map