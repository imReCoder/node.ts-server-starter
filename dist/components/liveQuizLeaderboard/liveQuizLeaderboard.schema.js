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
Object.defineProperty(exports, "__esModule", { value: true });
exports.liveQuizLeaderboard = exports.livequizleadrboardSchema = void 0;
const mongoose_1 = require("mongoose");
exports.livequizleadrboardSchema = new mongoose_1.Schema({
    roomId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Quizrooms",
        required: true
    },
    scores: [
        {
            userId: mongoose_1.Schema.Types.ObjectId,
            score: Number
        }
    ]
});
exports.livequizleadrboardSchema.methods.add = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return this.save();
    });
};
exports.liveQuizLeaderboard = mongoose_1.model("LiveQuizLeaderboard", exports.livequizleadrboardSchema);
//# sourceMappingURL=liveQuizLeaderboard.schema.js.map