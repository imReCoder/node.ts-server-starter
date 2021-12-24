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
exports.Result = exports.ResultSchema = void 0;
const mongoose_1 = require("mongoose");
exports.ResultSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    roomId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    score: { type: Number, required: true },
    questionsAnswered: [{
            quesId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Question' },
            answerMarked: String,
            isCorrect: Boolean,
            pointScored: Number
        }],
    countCorrect: { type: Number, default: 0 },
    accuracy: Number
}, {
    timestamps: true
});
exports.ResultSchema.methods.add = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return yield this.save();
    });
};
exports.ResultSchema.methods.playedBefore = function () {
    return __awaiter(this, void 0, void 0, function* () {
        let exist = yield mongoose_1.model('Score').findOne({ userId: this.userId, quizId: this.quizId });
        if (exist) {
            exist.score = 0;
            return yield exist.save();
        }
        else {
            return null;
        }
    });
};
exports.Result = mongoose_1.model('Result', exports.ResultSchema);
//# sourceMappingURL=result.schema.js.map