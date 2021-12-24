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
exports.socketServer = void 0;
const liveQuiz_model_1 = __importDefault(require("./liveQuiz.model"));
const node_cron_1 = require("node-cron");
exports.socketServer = (io) => __awaiter(void 0, void 0, void 0, function* () {
    io.on("connection", (socket) => {
        console.log(socket.id);
        let task;
        socket.on('joinRoom', ({ userId, roomId }) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(userId, roomId);
            const user = yield liveQuiz_model_1.default.joinRoom(socket.id, userId, roomId);
            console.log(roomId);
            socket.join(roomId);
            const liveQuiz = yield liveQuiz_model_1.default.getLiveQuiz(roomId);
            const liveQuizActiveUser = yield liveQuiz_model_1.default.activeUsers(roomId, 1);
            io.to(user.roomId).emit("totalPlayers", liveQuizActiveUser);
            if (liveQuiz.status == 'pending') {
                let questionCounter = 0;
                let totalQuestion = 25;
                yield liveQuiz_model_1.default.changeStatus(roomId);
                totalQuestion = yield liveQuiz_model_1.default.getQuestionCount(roomId, userId);
                console.log(totalQuestion);
                task = node_cron_1.schedule('*/30 * * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
                    if (questionCounter == totalQuestion) {
                        task.stop();
                        const data = yield liveQuiz_model_1.default.endQuiz(roomId);
                        io.to(roomId).emit("endQuiz", data);
                        const transaction = yield liveQuiz_model_1.default.addToWallet(roomId);
                        console.log(transaction);
                    }
                    else {
                        console.log(questionCounter, roomId);
                        const quesion = yield liveQuiz_model_1.default.getQuestions(roomId);
                        io.to(roomId).emit("startQuiz", quesion);
                        questionCounter = yield liveQuiz_model_1.default.increaseQuestionCount(roomId);
                    }
                }));
            }
        }));
        socket.on('submitAnswer', ({ userId, roomId, answer, questionId, points }) => __awaiter(void 0, void 0, void 0, function* () {
            yield liveQuiz_model_1.default.resultCalc(questionId, answer, userId, roomId, points);
        }));
        socket.on('end', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const user = yield liveQuiz_model_1.default.getUser(socket.id);
                yield liveQuiz_model_1.default.activeUsers(user.roomId, -1);
                console.log("disconnecting....");
                io.to(user.roomId).emit("userLeft", `user has left the chat`);
                socket.disconnect(true);
            });
        });
    });
});
//# sourceMappingURL=liveQuiz.listeners.js.map