import mongoose, { Document, Schema, Model } from "mongoose";

export interface NotificationInterface extends Document {
    title: string;
    message: string;
    status: object;
    user: string;
}
const NotificationSchema = new Schema<NotificationInterface> ({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "unread"
    },
    user: {
        type: String,
        required: true
    }
}, { timestamps: true })

const NotificationModel: Model<NotificationInterface> = mongoose.model("Notification", NotificationSchema);

export default NotificationModel;