import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import Order from '../models/Order';
import Cart from '../models/Cart';

export const createOrder = async (req: Request | any, res: Response) => {
  try {
    const { shippingAddress, phoneNumber } = req.body;

    if (!shippingAddress || !phoneNumber) {
      return res.status(400).json({ message: 'Shipping address and phone number are required' });
    }

    // Fail fast, and say why in the server log. With the keys unset the SDK
    // only surfaces an opaque authentication error from Razorpay's API, which
    // used to reach the customer as a bare "Server Error".
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay is not configured: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the backend .env');
      return res.status(503).json({ message: 'Online payments are not available right now. Please contact us to place your order.' });
    }

    // 1. Get the user's cart
    const cart = await Cart.findOne({ user: req.user?._id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'No items in cart' });
    }

    // 2. Calculate total and build order items
    let totalPrice = 0;
    const orderItems: any[] = [];
    
    for (const item of cart.items) {
      if (!item.product) continue;
      const price = (item.product as any).price;
      totalPrice += price * item.quantity;
      orderItems.push({
        product: (item.product as any)._id,
        quantity: item.quantity,
        priceAtPurchase: price,
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ message: 'One or more products in your cart are no longer available. Please refresh your cart.' });
    }

    // 3. Create Razorpay order
    const instance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const options = {
      amount: Math.round(totalPrice * 100),  // amount in smallest currency unit (paise for INR)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    let razorpayOrder;
    try {
      razorpayOrder = await instance.orders.create(options);
    } catch (gatewayError: any) {
      // The SDK rejects with { statusCode, error: { code, description } }.
      console.error(
        'Razorpay order creation failed:',
        gatewayError?.statusCode,
        gatewayError?.error?.description || gatewayError
      );
      // 401 means Razorpay refused our keys: a configuration problem, not
      // something the customer can fix by retrying.
      if (gatewayError?.statusCode === 401) {
        return res.status(503).json({ message: 'Online payments are not available right now. Please contact us to place your order.' });
      }
      return res.status(502).json({ message: "We couldn't reach the payment gateway. Please try again in a moment." });
    }

    // 4. Create the Order in DB
    const order = await Order.create({
      user: req.user?._id,
      items: orderItems,
      totalPrice,
      shippingAddress,
      phoneNumber,
      status: 'Pending Payment',
      paymentStatus: 'Pending',
      razorpayOrderId: razorpayOrder.id,
    });

    // 5. Cart will be cleared after successful payment verification

    // Return the created order populated
    await order.populate('items.product');
    // `keyId` is Razorpay's public key id (the secret never leaves the server).
    // Sending it with the order means the checkout window always uses the key
    // this server's secret belongs to, whatever the storefront was built with.
    res.status(201).json({
      order,
      razorpayOrderId: razorpayOrder.id,
      keyId: razorpayKeyId,
      amount: razorpayOrder.amount,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getMyOrders = async (req: Request | any, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const orders = await Order.find({ user: req.user?._id, status: { $ne: 'Pending Payment' } })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);
      
    const total = await Order.countDocuments({ user: req.user?._id, status: { $ne: 'Pending Payment' } });
      
    res.json({ orders, page: pageNumber, pages: Math.ceil(total / limitNumber), total });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getAllOrders = async (req: Request | any, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const orders = await Order.find({ status: { $ne: 'Pending Payment' } })
      .populate('user', 'id name email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);
      
    const total = await Order.countDocuments({ status: { $ne: 'Pending Payment' } });
      
    res.json({ orders, page: pageNumber, pages: Math.ceil(total / limitNumber), total });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateOrderStatus = async (req: Request | any, res: Response) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
