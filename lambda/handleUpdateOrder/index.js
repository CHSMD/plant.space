'use strict';

const dynamoose = require('dynamoose');

const orderSchema = new dynamoose.Schema({
  orderNumber: Number,
  plants: {
    type: Array,
    schema: [{
      type: Object,
      schema: {
        id: Number,
        quantity: Number,
      },
    }],
  },
  total: Object,
  status: String,
}, {
  saveUnknown: true,
});

const Order = dynamoose.model('order-table', orderSchema);

exports.handler = async (event) => {
  try {
    // Parse the order number from the request params
    let orderNumber = event.pathParameters.orderNumber;
    if (orderNumber) {
      orderNumber = parseInt(orderNumber);
    }

    // Get the order from the database
    const order = await Order.get(orderNumber);

    let today = new Date();
    let currentDate = today.toDateString();

    // Generate a tracking number that always starts with '1Z' and is 12 characters long
    let generateNumber = '1Z' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    let trackingNumber = generateNumber.toUpperCase();

    // Update the order status
    order.status = `Shipped on ${currentDate}. Tracking Number: ${trackingNumber}`;

    // Save the updated order to the database
    await order.save();

    // Return the updated order
    return {
      statusCode: 200,
      body: JSON.stringify(order),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.log('Error: ', error);
    return {
      statusCode: 500,
      body: JSON.stringify(error),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};
