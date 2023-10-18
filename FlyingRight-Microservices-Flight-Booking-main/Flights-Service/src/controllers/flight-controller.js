const { Logger } = require("../config");
const { FlightService } = require("../services/");
const { StatusCodes } = require("http-status-codes");
const { SuccessResponse, ErrorResponse } = require("../utils/common");
const { log } = require("winston");

/*
  POST : /Flights
  req.body : {flightNumber, airplaneId, departureAirportId, arrivalAirportId, arrvialTime, departureTime, price, boardingGate, totalSeats}
*/

async function createFlight(req, res) {
  try {
    const Flight = await FlightService.createFlight({
      flightNumber: req.body.flightNumber,
      airplaneId: req.body.airplaneId,
      departureAirportId: req.body.departureAirportId,
      arrivalAirportId: req.body.arrivalAirportId,
      arrivalTime: req.body.arrivalTime,
      departureTime: req.body.departureTime,
      price: req.body.price,
      boardingGate: req.body.boardingGate,
      totalSeats: req.body.totalSeats,
    });

    SuccessResponse.data = Flight;

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.log("error inside the controller", error);
    ErrorResponse.error = error;
    Logger.error(error);
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /Flights
 * req.query : {departureAirportId, arrivalAirportId}
 */

async function getAllFlights(req, res) {
  try {
    const flights = await FlightService.getAllFlights(req.query);
    SuccessResponse.data = flights;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    Logger.error(error);
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /Flights/:id
 * req.params : {id}
 */

async function getFlightById(req, res) {
  try {
    const flights = await FlightService.getFlightById(req.params.id);
    SuccessResponse.data = flights;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    Logger.error(error);
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

async function updateSeats(req, res) {
  try {
    console.log("dec in controllerc", req.body.dec);
    console.log(typeof req.body.dec);
    const flights = await FlightService.updateSeats({
      flightId: req.params.flightId,
      seats: req.body.seats,
      dec: req.body.dec,
    });

    SuccessResponse.data = flights;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    Logger.error(error);
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

module.exports = {
  createFlight,
  getAllFlights,
  getFlightById,
  updateSeats,
};
