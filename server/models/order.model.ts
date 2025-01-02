import mongoose, { Document, Schema, Model } from "mongoose";


export interface OrderInterface extends Document {
    courseId: string;
    userId: string;
    payment_info: object;
}
const orderSchema: Schema<OrderInterface> = new mongoose.Schema({
    courseId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    payment_info: {
        type: Object,
        // required: true
    }
}, { timestamps: true })

const OrderModel: Model<OrderInterface> = mongoose.model("Order", orderSchema);

export default OrderModel;