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
exports.Category = void 0;
const mongoose_1 = require("mongoose");
// import Wallet from '../wallet/wallet.model'
const CategorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    numberOfLevels: {
        type: Number,
        required: true
    },
    creator: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    icon: {
        type: String,
        default: 'https://polbol-media.s3.ap-south-1.amazonaws.com/ic_user_dummy.jpg',
        required: true
    },
    active: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
CategorySchema.methods.add = function () {
    return __awaiter(this, void 0, void 0, function* () {
        // await Wallet.updateNewAddedCategory(this._id);
        yield this.save();
    });
};
exports.Category = mongoose_1.model("Category", CategorySchema);
//# sourceMappingURL=category.schema.js.map