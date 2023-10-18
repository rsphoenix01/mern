const { StatusCodes } = require("http-status-codes");
const { Logger } = require("../config");
const { FlightRepository } = require("../repositories");
const AppError = require("../utils/errors/app-error");
const logger = require("../config/logger-config");
const { Op } = require("sequelize");
const { log } = require("winston");

// new instance of the FlightRepository class
const flightRepository = new FlightRepository();

async function createFlight(data) {
  try {
    const flight = await flightRepository.create(data);
    return flight;
  } catch (error) {
    logger.error(error);
    if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.forEach((err) => {
        explanation.push(err.message);
      });
      throw new AppError(explanation, StatusCodes.BAD_REQUEST); // Send client-related status code for SequelizeValidationError
    }
    throw new AppError(
      "Cannot create a new Flight Object!",
      StatusCodes.INTERNAL_SERVER_ERROR
    ); // Or else send server-related status code
  }
}

async function getAllFlights(query) {
  let customFilter = {};
  let sortFilter = [];
  const endingTripTime = "23:59:59";
  // trips?from=Paris&to=London
  if (query.trips) {
    [departureAirportId, arrivalAirportId] = query.trips.split("-");
    customFilter.departureAirportId = departureAirportId;
    customFilter.arrivalAirportId = arrivalAirportId;
    // TODO : add a validation to check if the departureAirportId and arrivalAirportId are same
  }

  if (query.price) {
    [minPrice, maxPrice] = query.price.split("-");
    customFilter.price = {
      [Op.between]: [minPrice, maxPrice == undefined ? 200000 : maxPrice],
    };
  }

  if (query.travellers) {
    customFilter.totalSeats = {
      [Op.gte]: query.travellers, // available seats should be greater than or equal to the number of travellers
    };
  }

  if (query.tripDate) {
    customFilter.departureDate = {
      [Op.between]: [query.tripDate, query.tripDate + " " + endingTripTime],
    };
  }

  if (query.sort) {
    const params = query.sort.split(","); // return an array
    const sortParams = params.map((param) => param.split("_"));
    // return an array of arrays [[price, asc],[departureDate, desc]]]
    sortFilter = sortParams;
  }

  try {
    const flights = await flightRepository.getAllFlights(
      customFilter,
      sortFilter
    );
    return flights;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Something went wrong while getting the flights!",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function getFlightById(data) {
  try {
    const flight = await flightRepository.get(data);
    return flight;
  } catch (error) {
    console.log("error in service is", error);
    Logger.error(error);

    if (error.statusCode == StatusCodes.NOT_FOUND) {
      throw new AppError(
        "The Flight you requested is not present in the database",
        error.statusCode
      );
    }
    throw new AppError(
      "Something went wrong while getting Flight by id",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function updateSeats(data) {
  try {
    const response = await flightRepository.updateRemainingSeats(
      data.flightId,
      data.seats,
      data.dec
    );
    return response;
  } catch (error) {
    console.log("error in update seat service ", error);
    if (error.statusCode == StatusCodes.NOT_FOUND) {
      throw new AppError(
        "Can't update the data of the flight, requested by you",
        error.statusCode
      );
    }
    throw new AppError(
      "Something went wrong updating seats id",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports = {
  createFlight,
  getAllFlights,
  getFlightById,
  updateSeats,
};
