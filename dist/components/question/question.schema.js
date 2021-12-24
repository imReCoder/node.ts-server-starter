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
exports.Question = exports.quesSchema = void 0;
const mongoose_1 = require("mongoose");
exports.quesSchema = new mongoose_1.Schema({
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    level: {
        type: Number,
        min: 0,
        max: 10,
        required: true
    },
    content: {
        isText: { type: Boolean, required: true },
        question: {
            type: String,
            required: true
        },
        answerImage: {
            type: String,
        }
    },
    options: [{
            isText: { type: Boolean, required: true },
            text: String,
            image: {
                type: String,
                default: 'https://polbol-media.s3.ap-south-1.amazonaws.com/ic_user_dummy.jpg'
            }
        }],
    hints: [{
            isText: { type: Boolean, required: true },
            text: String,
            image: {
                type: String,
                default: 'https://polbol-media.s3.ap-south-1.amazonaws.com/ic_user_dummy.jpg'
            },
            cost: { type: Number, required: true }
        }],
    creator: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    },
    answer: {
        type: String,
        required: true,
    },
    points: { type: Number, required: true },
    archived: {
        type: Boolean,
        required: true,
        default: false
    }
});
exports.quesSchema.methods.add = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return yield this.save();
    });
};
exports.Question = mongoose_1.model("Question", exports.quesSchema);
//# sourceMappingURL=question.schema.js.map