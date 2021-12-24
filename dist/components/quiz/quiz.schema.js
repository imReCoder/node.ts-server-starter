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
exports.Quiz = exports.quizSchema = void 0;
const mongoose_1 = require("mongoose");
const crypto_1 = __importDefault(require("crypto"));
exports.quizSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true
    },
    timeAlloted: {
        type: Number
    },
    creator: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    questions: [{
            level: { type: Number },
            category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category' },
            questionsCount: { type: Number }
        }],
    metadata: {
        maxWinner: Number,
        maxScore: Number,
        maxQuestions: Number,
        maxPlayers: Number,
        maxAttempts: Number,
        minPlayers: Number
    },
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    lastDateToRegister: {
        type: Date,
        required: true,
    },
    code: {
        type: String,
    },
    scheduled: Boolean,
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    coverImage: {
        type: String,
        required: true,
        default: 'https://polbol-media.s3.ap-south-1.amazonaws.com/ic_user_dummy.jpg'
    },
    description: String,
    hidden: {
        type: Boolean,
        default: false
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        required: true,
        default: 'public'
    },
    liveQuiz: {
        type: Boolean,
        required: true
    },
    poolAmount: { type: Number, default: 0 },
    isFreebie: Boolean,
    totalRegistrations: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'dropped', 'finished'],
    },
    prizes: [{
            prize: Number,
            userId: String,
            prizeDistributed: {
                type: Boolean,
                default: false
            }
        }],
    numberOfTimes: {
        type: Number,
        required: true,
        default: 5
    },
    isPrizeDistributed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
exports.quizSchema.pre('save', function () {
    return __awaiter(this, void 0, void 0, function* () {
        this.code = crypto_1.default.randomBytes(3).toString('hex');
    });
});
exports.quizSchema.methods.add = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return this.save();
    });
};
exports.Quiz = mongoose_1.model("QuizRoom", exports.quizSchema);
//# sourceMappingURL=quiz.schema.js.map