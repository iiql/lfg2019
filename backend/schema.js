/**
* @fileoverview This file defines the local HDQL environment schema.
* Modify this file to add or change the variables and methods available within the query environment.
*/
"use strict";

// Get a handle to the mockup interface:
var db = require("./mockDB");

let schema = {
  vars: {
      age: {
        type: "int",
        english: "your age",
        getter: function(uid) { return db.getAge(uid); }
      },
      social: {
        type: "int",
        english: "your social security number",
        getter: function(uid) { return db.getSocial(uid); }
      },
      dob: { type: "object", val: {
        day: {
          type: "int",
          english: "the day of your birth",
          getter: function(uid) { return db.getDobDay(uid); }
        },
        month: {
          type: "int",
          english: "the month of your birth",
          getter: function(uid) { return db.getDobMonth(uid); }
        },
        year: {
          type: "int",
          engligh: "the year of your birth",
          getter: function(uid) { return db.getDobYear(uid); }
        },
      }},
      address: {
        type: "string",
        engligh: "your address",
        getter: function(uid) { return db.getAddress(uid); }
      },
      email: {
        type: "string",
        english: "your email address",
        getter: function(uid) { return db.getEmail(uid); }
      },
      cellphone: {
        type: "int",
        engligh: "your cellphone number",
        getter: function(uid) { return db.getCellphone(uid); }
      }
  },
  functions: {
    not: {
      returns: "bool",
      params: [ [ "string", "int", "double", "bool" ] ],
      english: "the negated value of {0}",
      exec: function(a) { return !a; }
    },
    add: {
      returns: "double",
      params: [ [ "int", "double" ], [ "int", "double" ] ],
      english: "{0} plus {1}",
      exec: function(a, b) { return a.val + b.val; }
    },
    sub: {
      returns: "double",
      params: [ [ "int", "double" ], [ "int", "double" ] ],
      english: "{0} minus {1}",
      exec: function(a, b) { return a.val - b.val; }
    },
    div: {
      returns: "double",
      params: [ [ "int", "double" ], [ "int", "double" ] ],
      english: "{0} divided by {1}",
      exec: function(a, b) { return a / b; }
    },
    mul: {
      returns: "double",
      params: [ [ "int", "double" ], [ "int", "double" ] ],
      english: "{0} times {1}",
      exec: function(a, b) { return a * b; }
    },
    mod: {
      returns: "double",
      params: [ [ "int", "double" ], [ "int", "double" ] ],
      english: "{0} modulus {1}",
      exec: function(a, b) { return a % b; }
    },
    concat: {
      returns: "string",
      params: [ [ "string" ], [ "string" ] ],
      english: "{0} concatenated with {1}",
      exec: function(a, b) { return a.val + b.val; }
    },
    equal_to: {
      returns: "bool",
      params: [ [ "string", "int", "double", "bool" ], [ "string", "int", "double", "bool" ] ],
      english: "if {0} is equal to {1}",
      exec: function(a, b) { return a.val === b.val }
    },
    less_than: {
      returns: "bool",
      params: [ [ "string", "int", "double", "bool" ], [ "string", "int", "double", "bool" ] ],
      english: "if {0} is less than {1}",
      exec: function(a, b) { return (a.type === b.type)?(a.val < b.val):false; }
    },
    greater_than: {
      returns: "bool",
      params: [ [ "string", "int", "double", "bool" ], [ "string", "int", "double", "bool" ] ],
      english: "if {0} is greater than {1}",
      exec: function(a, b) { return (a.type === b.type)?(a.val < b.val):false; }
    },
  }
};

// Export the schema:
module.exports = schema;
