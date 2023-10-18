const { TicketRepository } = require("../repositories");
const { mailsender } = require("../config");
const ticketRepo = new TicketRepository();

async function sendEmail(mailFrom, mailTo, subject, text, html) {
  try {
    const response = await mailsender.sendMail({
      from: {
        name: "FlyRight Airlines",
        address: mailFrom,
      },
      to: mailTo,
      subject: subject,
      text: text,
      html: html,
    });
    return response;
  } catch (error) {
    console.log(error);
  }
}

async function createTicket(data) {
  try {
    const response = await ticketRepo.create(data);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getpendingEmails() {
  try {
    const response = await ticketRepo.getPendingTickets();
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getTodaysTickets(today) {
  try {
    const response = await ticketRepo.getTodaysTickets(today);
    return response;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  sendEmail,
  createTicket,
  getpendingEmails,
  getTodaysTickets,
};
