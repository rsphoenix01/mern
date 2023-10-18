const { StatusCodes } = require("http-status-codes");

const { BookingService } = require("../services");
const { SuccessResponse, ErrorResponse } = require("../utils/common");

// This is a temporary in-memory database to store the idempotent key. We are using memoization to store the idempotent key. This is not a good practice. We should use a database like Redis to store the idempotent key.
// Once the server restarts, the inMemDb will be empty. So, we will  be able to process the same payment request again. This is the reason why we should use a database like Redis to store the idempotent key.

const inMemDb = {};

async function createBooking(req, res) {
  try {
    console.log(req.user);
    const booking = await BookingService.createBooking({
      flightId: req.body.flightId,
      userInfo: req.user,
      noOfSeats: req.body.noOfSeats,
    });
    SuccessResponse.data = booking;
    console.log("first response", SuccessResponse);
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    console.log(
      "Found error obj inside booking controller -----",
      error.statusCode
    );
    return res.status(StatusCodes.SERVICE_UNAVAILABLE).json(ErrorResponse);
  }
}

async function makePayment(req, res) {
  try {
    const idempotentKey = req.headers["idempotent-key"];

    if (inMemDb[idempotentKey]) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Cannot process the same payment request again" });
    }

    const booking = await BookingService.makePayment({
      bookingId: req.body.bookingId,
      userInfo: req.user,
      totalCost: req.body.totalCost,
    });

    inMemDb[idempotentKey] = idempotentKey;

    SuccessResponse.data = booking;
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    console.log(
      "Found error obj inside booking/makePayment controller -----",
      error
    );
    return res.status(StatusCodes.SERVICE_UNAVAILABLE).json(ErrorResponse);
  }
}

async function getAllBookings(req, res) {
  try {
    const bookings = await BookingService.getAllBookings(req.params.userId);
    SuccessResponse.data = bookings;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(StatusCodes.SERVICE_UNAVAILABLE).json(ErrorResponse);
  }
}

async function cancelBooking(req, res) {
  try {
    const data = { bookingId: req.params.bookingId, userInfo: req.user };
    const booking = await BookingService.cancelBooking(data);
    SuccessResponse.data = booking;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(StatusCodes.SERVICE_UNAVAILABLE).json(ErrorResponse);
  }
}

module.exports = { createBooking, makePayment, getAllBookings, cancelBooking };
