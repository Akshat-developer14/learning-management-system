import mongoose, {Document, Schema, Model} from "mongoose";
import { UserInterface } from "./user.model";

interface CommentInterface extends Document {
    user: UserInterface;
    question: string;
    questionReplies?: CommentInterface[];
}

interface ReviewInterface extends Document {
    user: UserInterface;
    rating: number;
    comment: string;
    commentReplies?: CommentInterface[];
}

interface LinkInterface extends Document {
    title: string;
    url: string;
}

interface CourseDataInterface extends Document {
    title: string;
    description: string;
    videoUrl: string;
    videoThumbnail: object;
    videoSection: string;
    videoLength: number;
    videoPlayer: string;
    links: LinkInterface[];
    suggestion: string;
    questions: CommentInterface[];
}

interface CourseInterface extends Document {
    name: string;
    description: string;
    price: number;
    estimatedPrice?: number;
    thumbnail: object;
    tags: string;
    level: string;
    demoUrl: string;
    benefits: { title: string }[];
    prerequisites: { title: string }[];
    reviews: ReviewInterface[];
    courseData: CourseDataInterface[];
    ratings?: number;
    purchased?: number;
}

const reviewSchema = new Schema<ReviewInterface>({
    user: Object,
    rating: {
        type: Number,
        default: 0
    },
    comment: String,
    commentReplies: [Object]
})

const linkSchema = new Schema<LinkInterface>({
    title: String,
    url: String
})

const commentSchema = new Schema<CommentInterface>({
    user: Object,
    question: String,
    questionReplies: [Object]
})


const courseDataSchema = new Schema<CourseDataInterface>({
    title: String,
    description: String,
    videoUrl: String,
    videoLength: Number,
    videoPlayer: String,
    links: [linkSchema],
    suggestion: String,
    questions: [commentSchema]
})

const courseSchema = new Schema<CourseInterface>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    estimatedPrice: {
        type: Number,
        required: false
    },
    thumbnail: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        }
    },
    tags: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    },
    demoUrl: {
        type: String,
        required: true
    },
    benefits: [{ title: String }],
    prerequisites: [{ title: String }],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: {
        type: Number,
        default: 0
    },
    purchased: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

const CourseModel: Model<CourseInterface> = mongoose.model("Course", courseSchema);

export default CourseModel;
