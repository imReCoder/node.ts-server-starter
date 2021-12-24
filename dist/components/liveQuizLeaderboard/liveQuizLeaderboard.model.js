"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveQuizLeaderboardModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const liveQuizLeaderboard_schema_1 = require("./liveQuizLeaderboard.schema");
class LiveQuizLeaderboardModel {
    add(body) {
        return __awaiter(this, void 0, void 0, function* () {
            body.scores = [];
            const leaderboard = new liveQuizLeaderboard_schema_1.liveQuizLeaderboard(body);
            const data = yield leaderboard.add();
            return data;
        });
    }
    ;
    updateleaderboard(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const isLeaderboard = yield this.isLeaderboardAlreadyExist(body.roomId);
            if (!isLeaderboard.alreadyExist) {
                const leaderboard = yield this.add(body);
                if (leaderboard != null) {
                    yield liveQuizLeaderboard_schema_1.liveQuizLeaderboard.findOneAndUpdate({ roomId: body.roomId }, {
                        $push: { "scores": { userId: body.userId, score: body.score } }
                    }, {
                        new: true,
                    });
                }
            }
            else {
                const isUser = yield this.isUserExist(body.roomId, body.userId);
                if (isUser.alreadyExist) {
                    yield this.updateScore(body.roomId, body.userId, body.score);
                }
                else {
                    yield liveQuizLeaderboard_schema_1.liveQuizLeaderboard.findOneAndUpdate({ roomId: body.roomId }, {
                        $push: { "scores": { userId: body.userId, score: body.score } }
                    }, {
                        new: true,
                    });
                }
            }
            ;
        });
    }
    ;
    isUserExist(roomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const leaderboard = yield liveQuizLeaderboard_schema_1.liveQuizLeaderboard.findOne({ $and: [{ roomId: roomId }, { scores: { $elemMatch: { userId: userId } } }] });
            console.log(leaderboard);
            if (leaderboard) {
                return { alreadyExist: true };
            }
            return { alreadyExist: false };
        });
    }
    ;
    updateScore(roomId, userId, point) {
        return __awaiter(this, void 0, void 0, function* () {
            const leaderboard = yield liveQuizLeaderboard_schema_1.liveQuizLeaderboard.findOneAndUpdate({ $and: [{ roomId: roomId }, { scores: { $elemMatch: { userId: userId } } }] }, {
                $inc: { "scores.$.score": point }
            }, {
                new: true
            });
            console.log(leaderboard);
        });
    }
    ;
    isLeaderboardAlreadyExist(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const leaderboard = yield liveQuizLeaderboard_schema_1.liveQuizLeaderboard.findOne({ roomId });
            if (leaderboard == null) {
                return { alreadyExist: false };
            }
            return { alreadyExist: true };
        });
    }
    ;
    getLeaderboard(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(roomId);
            const leaderboard = yield liveQuizLeaderboard_schema_1.liveQuizLeaderboard.aggregate([
                {
                    $match: { roomId: new mongoose_1.default.Types.ObjectId(roomId) }
                },
                {
                    $unwind: '$scores'
                },
                {
                    $sort: { 'scores.score': -1 }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "scores.userId",
                        foreignField: "_id",
                        as: "scores.userId"
                    }
                },
            ]);
            return leaderboard;
        });
    }
}
exports.LiveQuizLeaderboardModel = LiveQuizLeaderboardModel;
exports.default = new LiveQuizLeaderboardModel();
//# sourceMappingURL=liveQuizLeaderboard.model.js.map