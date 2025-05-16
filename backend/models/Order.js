import mongoose, { mongo } from "mongoose";

const OrderSchema = new mongoose.Schema({
    custumer:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    restaurant:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    items: [{
        meal:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Meal',
            required: true
        },
        quantity:{
            type: Number,
            required: true,
            default: 1
        },
        price:{
            type: Number,
            required: tru
        }
    }],
    totalAmount:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        enum: ['ordered', 'preparing', 'delivering', 'delivered'],
        required: true
    },
    deliveryType: {
        type: String,
        enum: ['pickup', 'delivery'],
        required: true
    },
    deliveryAddress: {
        street: String,
        city: String,
        zipCode: String,
        country: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    estimatedTime: {
    type: Number  // In minutes
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;