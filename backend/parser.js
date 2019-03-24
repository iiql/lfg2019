/**
* @fileoverview Provides the necessary utilities to build a parse-tree forest of HDQL queries.
*/
"use strict";

// Staticly define all REGEXP variables:
const FILTER_COMMENTS = /\/\*(?:(?!\*\/).)*\*\//,
      FILTER_STRINGS = /(?<!\\)"/,
      FILTER_WHITESPACE = /\s+/,
      FILTER_OUTER_WHITESPACE = /^\s+|\s+$/,
      TEST_SPACE = /\s/,
      TEST_IF = /^\s*if\s*$/,
      TEST_AS = /^\s*as\s*$/,
      TEST_METHOD = /^\s*\(.*\)\s*$/,
      TEST_VARIABLE = /^[a-zA-Z_][a-zA-Z0-9_\.]*$/,
      TEST_INT = /^\s*(0.)?[0-9]*\s*$/,
      TEST_DOUBLE = /^\s*[0-9]*\.[0-9]*\s*$/,
      TEST_STRING = /^\s*".*"\s*$/,
      TEST_BOOL = /^\s*(true|false)\s*$/;

/**
* Tokenizes the surface of the query string
* @param {string} query The singular, preprocessed query string to tokenize.
* @return {Array<string>} The tokenized surface query.
*/
function tokenizeQuery(query) {
  var out = [];
  var start = 0, depth = 0;

  for(let i = 0; i < query.length; ++i) {
    if(query[i] === '(') {
      if(depth === 0) {
        out.push(query.substring(start, i));
        start = i;
      }
      ++depth;
    } else if(query[i] === ')') {
      --depth;
      if(depth === 0) {
        out.push(query.substring(start, i + 1));
        start = i + 1;
      }
    } else if(depth === 0 && TEST_SPACE.test(query[i])) {
      out.push(query.substring(start, i));
      start = i;
    }
  }
  out.push(query.substring(start, query.length));

  return out.filter(function(el) { return el != "" });
}


/**
* Parses the content of an "IF ... THEN ... [ELSE] ... FI" statement.
* @param {Array<string>} tokens the tokenized sub-query string.
* @param {function(Array<string>|null, Object)} callback A handle to the callback function to call with the results.
*/
function parseIf(tokens, callback) {
  let out = { type: "if" };
  let depth = 1;
  let start = 1;

  // Parse the conditional:
  for(let index = 1; index < tokens.length; ++index) {
    let token = tokens[index].split(FILTER_WHITESPACE).join("");
    if(token === "if") {
      // Increase the depth from the surface:
      ++depth;
    } else if(token === "fi") {
      // Decrease the depth from the surface, and end the loop if at the surface:
      if(--depth === 0) {
        // Execute subcall to compile "THEN" or "ELSE" block:
        return genTree(tokens.slice(start, index), function(err, res) {
          if(err !== null) {
            return callback(err, null);
          }

          if(out.then == undefined) {
            out.then = res;
          } else {
            out.else = res;
          }

          // Execute the callback:
          return callback(null, out);
        });
      }
    } else if(depth !== 1) {
      // skip internal parsing for non-surface block elements:
      continue;
    } else if(token === "then") {
      // Parse the surface conditional block (there should be only one):
      if(out.conditional != undefined) {
        return callback("malformed \"THEN\" block: \"" + tokens.join("") + "\"", null);
      }

      // Execute subcall to compile conditional block:
      let err = genTree(tokens.slice(start, index), function(err, res) {
        out.conditional = res;
        start = index + 1;
        return err;
      });

      // Handle the error from the subcall:
      if(err != null){
        return callback(err, null);
      }
    } else if(token === "else") {
      // Parse the surface THEN block (there should be only one):
      if(out.then != undefined) {
        return callback("malformed \"ELSE\" block: \"" + tokens.join("") + "\"", null);
      }

      // Execute subcall to compile THEN block:
      let err = genTree(tokens.slice(start, index), function(err, res) {
        out.then = res;
        start = index + 1;
        return err;
      });

      // Handle the error from the subcall:
      if(err != null){
        return callback(err, null);
      }
    }
  }

  // The end was never reached
  return callback("malformed \"IF\" block: \"" + tokens.join("") + "\"", null);
}


/**
* Parses the content of a "... AS ..." statement.
* @param {Array<string>} tokens the tokenized sub-query string.
* @param {function(Array<string>|null, Object)} callback A handle to the callback function to call with the results.
*/
function parseAs(tokens, callback) {
  let out = { type: "as" };

  // Establish the target type:
  out.conversion = tokens[tokens.length - 1].split(FILTER_WHITESPACE).join("");

  // Execute sub-call on operand:
  return genTree([ tokens.slice(0, tokens.length - 2) ], function(err, res) {
    if(err) {
      return callback(err, null);
    }
    out.val = res;
    return callback(null, out);
  });
}


/**
* Parses the content of a "method(...)" statement.
* @param {Array<string>} tokens the tokenized sub-query string.
* @param {function(Array<string>|null, Object)} callback A handle to the callback function to call with the results.
*/
function parseMethod(tokens, callback) {
  let out = { type: "method" };

  // Obtain the method name:
  out.name = tokens[0].split(FILTER_WHITESPACE).join("");
  if(!TEST_VARIABLE.test(out.name))
    return callback("malformed method name: \"" + out.name + "\"", null);

  // Retrieve the parameters:
  let params = [ [ ] ];

  (tokens[1].substring(1, tokens[1].length - 1) + ",").split(FILTER_STRINGS).forEach(function(part, index) {
    // Handle string elements:
    if (index % 2 === 1) {
      params[params.length - 1].push(part);
      return;
    }

    let commas = part.split(",");
    params[params.length - 1].push(commas.shift());
    while (commas.length > 0)
      params.push([ commas.shift() ]);
  });

  // Filter out results:
  params = params.filter(function(el) { return el != "" });

  // Splice the results:
  out.params = [];
  for(let i = 0; i < params.length; ++i) {
    let tmp = genTree(tokenizeQuery(params[i].join("\"")), function(err, res) {
      out.params[i] = res;
      return err;
    });
    if(tmp !== null)
      return callback(tmp, null);
  }

  // Return the command array:
  return callback(null, out);
}


/**
* Parses the content of a variable acces request.
* @param {Array<string>} tokens the tokenized sub-query string.
* @param {function(Array<string>|null, Object)} callback A handle to the callback function to call with the results.
*/
function parseVar(tokens, callback) {
  let out = { type: "var" };
  out.name = tokens[0].split(FILTER_WHITESPACE).join("");
  return callback(null, out);
}


/**
* Parses the content of a "bool" value.
* @param {Array<string>} tokens the tokenized sub-query string.
* @param {function(Array<string>|null, Object)} callback A handle to the callback function to call with the results.
*/
function parseBool(tokens, callback) {
  let out = { type: "bool" };
  let str = tokens[0].split(FILTER_WHITESPACE).join("");
  if(str === "true")
    out.val = true;
  else
    out.val = false
  return callback(null, out);
}


/**
* Parses the content of a "int" value.
* @param {Array<string>} tokens the tokenized sub-query string.
* @param {function(Array<string>|null, Object)} callback A handle to the callback function to call with the results.
*/
function parseInteger(tokens, callback) {
  let out = { type: "int" };
  let str = tokens[0].split(FILTER_WHITESPACE).join("");

  // Handle the numerical base:
  let radix = 10;
  if(str[0] === '0') {
    str = str.substring(1);
    radix = 8;
    if(str[0] === 'x') {
      str = str.substring(1);
      radix = 16;
    } else if(str[0] === 'b') {
      str = str.substring(1);
      radix = 2;
    }
  }

  // Parse the value:
  out.val = parseInt(str, radix);

  return callback(null, out);
}


/**
* Parses the content of a "double" value.
* @param {Array<string>} tokens the tokenized sub-query string.
* @param {function(Array<string>|null, Object)} callback A handle to the callback function to call with the results.
*/
function parseDouble(tokens, callback) {
  let out = { type: "double" };
  let str = tokens[0].split(FILTER_WHITESPACE).join("");

  // Parse the value:
  out.val = parseFloat(str);

  return callback(null, out);
}


/**
* Parses the content of a "string" value.
* @param {Array<string>} tokens the tokenized sub-query string.
* @param {function(Array<string>|null, Object)} callback A handle to the callback function to call with the results.
*/
function parseString(tokens, callback) {
  let out = { type: "string" };
  let str = tokens[0].split(FILTER_OUTER_WHITESPACE).join("");

  // Parse the value:
  out.val = JSON.parse(str);

  return callback(null, out);
}


/**
* Generates a parse-tree for a single query.
* @param {Array<string>} tokens The tokenized, singular HDQL query to be parsed.
* @param {function(Array<string>|null, Object)} callback A handle to the callback function to call with the results.
*/
function genTree(tokens, callback) {
  // Filter out "AS" typecasts:
  if(tokens.length > 2 && TEST_AS.test(tokens[tokens.length - 2]))
    return parseAs(tokens, callback);

  // Filter out "IF" statements:
  if(tokens.length > 1 && TEST_IF.test(tokens[0]))
    return parseIf(tokens, callback);

  // Filter out method calls:
  if(tokens.length === 2 && TEST_METHOD.test(tokens[1]))
    return parseMethod(tokens, callback);

  // Filter out variable calls:
  if(tokens.length === 1 && TEST_VARIABLE.test(tokens[0]))
    return parseVar(tokens, callback);

  // Filter out constant booleans:
  if(tokens.length === 1 && TEST_BOOL.test(tokens[0]))
    return parseBool(tokens, callback);

  // Filter out constant integers:
  if(tokens.length === 1 && TEST_INT.test(tokens[0]))
    return parseInteger(tokens, callback);

  // Filter out constant doubles:
  if(tokens.length === 1 && TEST_DOUBLE.test(tokens[0]))
    return parseDouble(tokens, callback);

  // Filter out constant strings:
  if(tokens.length === 1 && TEST_STRING.test(tokens[0]))
    return parseString(tokens, callback);

  // Report a syntax error:
  return callback("Could not match query \"" + tokens.join("") + "\"", null);
}


/**
* Preprocesses the command string to remove Comments & split by semicolons.
* @param {string} query The HDQL query to process
* @return {Array<String>} The split subqueries.
*/
function hdqlPreprocessor(query) {
  let out = [ [ ] ];

  // Iterate through the array:
  query.split(FILTER_STRINGS).forEach(function(part, index) {
    // Handle string elements:
    if (index % 2 === 1) {
      out[out.length - 1].push(part);
      return;
    }

    // Parse proceedure:
    part = part.split(FILTER_COMMENTS).join("");
    let semis = part.split(";");
    out[out.length - 1].push(semis.shift());
    while (semis.length > 0)
      out.push([ semis.shift() ]);
  });

  // Rejoin each command:
  for (let i = 0; i < out.length; ++i)
    out[i] = out[i].join("\"");

  // Return the command array:
  return out;
}


/**
* Generates a forest of parse-trees of the given query.
* @param {string} query The HDQL query or query set to be parsed.
* @param {function(Array<string>|null, Array<Object>)} callback A handle to the callback function to call with the results.
*/
function genForest(query, callback) {
  // Setup the output buffers:
  var out = [];
  var errOut = [];
  var addOut = function(err, tree) {
    if (err)
      errOut.push(err);
    else
      out.push(tree);
  };

  // (sanity-check) Filter out null queries:
  if (query.length == 0)
    return callback([ "Null query string not allowed" ], null);

  // (sanity-check) Filter out terminating semicolons:
  if (query[query.length - 1] != ";")
    errOut.push("Query string must end with a ';'");
  else
    query = query.substring(0, query.length - 1);

  // Parse the query:
  hdqlPreprocessor(query).forEach((subquery) => {
    genTree(tokenizeQuery(subquery.toLowerCase()), addOut);
  });

  // Determine the results:
  if (errOut.length > 0)
   return callback(errOut, null);
  return callback(null, out);
}


// Export the forest generator:
module.exports = genForest;
