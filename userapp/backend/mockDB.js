/**
* @fileoverview This provides a mockup of the database with which we would be interfacing.
* In a production setting, this file would be replaced by an interface to the Citi Bank API.
*/

// Create an object to store the mockup:
// NOTE: This is not our real information.
let mockup = {
  andrew: {
    age: 20,
    social: 936817330,
    dob: { day: 23, month: 02, year: 1987 },
    address: "8174 notareal st, Nowhere, ZZ",
    email: "agj221@lehigh.edu",
    cellphone: 4659872747
  },
  anil: {
    age: 20,
    social: 491759173,
    dob: { day: 18, month: 09, year: 1992 },
    address: "1857 Sunflower av, Waterbridge, AZ",
    email: "anilmorisetti@gmail.com",
    cellphone: 2424460913
  },
  buckley: {
    age: 19,
    social: 298381928,
    dob: { day: 01, month: 11, year: 2008 },
    address: "1337 Hard dr, Silicon Valley, CA",
    email: "haximilian@gmail.com",
    cellphone: 5627343486
  },
  ryan: {
    age: 19,
    social: 283174290,
    dob: { day: 12, month: 12, year: 1929 },
    address: "3789 Ohlookitsstelly, Some Town, FL",
    email: "stellyman00@gmail.com",
    cellphone: 6206869013
  }
};

// Declare the interface:
module.exports = {
  getAge: function(username) { return mockup[username].age; },
  getSocial: function(username) { return mockup[username].social; },
  getDobDay: function(username) { return mockup[username].dob.day; },
  getDobMonth: function(username) { return mockup[username].dob.month; },
  getDobYear: function(username) { return mockup[username].dob.year; },
  getAddress: function(username) { return mockup[username].address; },
  getEmail: function(username) { return mockup[username].email; },
  getCellphone: function(username) { return mockup[username].cellphone; }
};
