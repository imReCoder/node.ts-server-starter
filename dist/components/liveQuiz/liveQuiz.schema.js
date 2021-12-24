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
exports.LiveQuiz = exports.livequizSchema = void 0;
const mongoose_1 = require("mongoose");
exports.livequizSchema = new mongoose_1.Schema({
    roomId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Quizrooms',
        required: true
    },
    users: [{
            userId: mongoose_1.Schema.Types.ObjectId,
            socketId: String
        }],
    status: {
        type: String,
        enum: ['active', 'closed', 'pending'],
        default: 'pending'
    },
    activeUserCount: {
        type: Number,
        default: 0
    },
    questionCount: {
        type: Number,
        default: 0
    }
});
exports.livequizSchema.methods.add = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return yield this.save();
    });
};
exports.LiveQuiz = mongoose_1.model("LiveQuiz", exports.livequizSchema);
//# sourceMappingURL=liveQuiz.schema.js.map