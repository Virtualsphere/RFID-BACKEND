import mongoose, { Document, Schema } from 'mongoose';
import { IProduct } from './Product';
import { IUser } from './User';

export interface IOrderItem {
  product: mongoose.Types.ObjectId | IProduct;
  quantity: number;
  priceAtPurchase: number; // Snapshot of the price
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId | IUser;
  items: IOrderItem[];
  /** What the customer is charged: `subtotal` + `gstAmount` (orders placed before GST was added: just the items). */
  totalPrice: number;
  /** Items before GST. Absent on orders placed before GST was added. */
  subtotal?: number;
  /** The GST rate that applied, in percent. */
  gstRate?: number;
  gstAmount?: number;
  status: 'Pending Payment' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  shippingAddress: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  priceAtPurchase: {
    type: Number,
    required: true,
  },
});

const OrderSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [OrderItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    // No defaults: an order without these was placed before GST was added.
    subtotal: {
      type: Number,
    },
    gstRate: {
      type: Number,
    },
    gstAmount: {
      type: Number,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending Payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending Payment',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
