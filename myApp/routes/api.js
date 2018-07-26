const keyPublishable = process.env.PUBLISHABLE_KEY;
//const keySecret = process.env.SECRET_KEY;
const keySecret = 'sk_test_qBQ7uEhbyUahpxrNTf5c8ugz';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var stripe = require('stripe')(keySecret);

var moment = require('moment');

var User = mongoose.model('User');
var Flight = require('../models/Flight');
var Airport = require('../models/Airport');
var Aircraft = require('../models/Aircraft');
var Inventory = require('../models/Inventory');
var Traveler = require('../models/Traveler');
var Payment = require('../models/Payment');
var Reservation = require('../models/Reservation');

/* REGISTER */
router.post('/signup', function (req, res) {
  if (!req.body.username || !req.body.password) {
    res.json({ success: false, msg: 'Please pass username and password.' });
  } else {
    var newUser = new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      phone: req.body.phone,
      date_created: req.body.date_created,
      role_id: req.body.role_id,
      privilege_id: req.body.privilege_id,
      status_id: req.body.status_id
    });
    // save the user
    newUser.save(function (err) {
      if (err) {
        return res.status(403).send({ success: false, msg: 'Username already exists.' });
      }
      res.json({ success: true, msg: 'Successful created new user.' });
    });
  }
});

/* LOGIN */
router.post('/signin', function (req, res) {
  User.findOne({
    username: req.body.username
  }, function (err, user) {
    if (err) throw err;
    if (!user) {
      res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(user.toJSON(), config.secret);
          // return the information including token as JSON
          res.json({ success: true, token: 'JWT ' + token });
          //res.json({success: true, token: 'JWT ' + token, profile: user.toJSON()});
        } else {
          res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
        }
      });
    }
  });
});

/* GET DATA for HOME */
router.get('/user/:username', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    User.find(
      { username: req.params.username },
      { password: 0 },
      function (err, user) {
        if (err) return next(err);
        if (!user) {
          res.status(403).send({ success: false, msg: 'Authentication failed. User not found.' });
        } else {
          return res.json(user);
        }
      });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* GET data for ADMIN */
router.get('/admin', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    return res.sendStatus(200);
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* GET USERS for ADMIN*/
router.get('/users', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    User.find({
    }, function (err, users) {
      if (err) return next(err);
      if (!users) {
        res.status(401).send({ success: false, msg: 'Authentication failed!' });
      } else {
        // get the list of users
        return res.json(users);
      }
    });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* SAVE USER */
router.post('/user-create', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    var newUser = new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      phone: req.body.phone,
      date_created: req.body.date_created,
      role_id: req.body.role_id,
      privilege_id: req.body.privilege_id,
      status_id: req.body.status_id
    });

    newUser.save(function (err) {
      if (err) {
        return res.status(403).send({ success: false, msg: 'Save user failed.' });
      }
      res.json({ success: true, msg: 'Successful created new user.' });
    });
  } else {
    return res.status(401).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* GET SINGLE USER BY USERNAME */
router.get('/user-detail/:username', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    User.find(
      { username: req.params.username }
      , function (err, user) {
        if (err) return next(err);
        if (!user) {
          res.status(403).send({ success: false, msg: 'Search failed. User not found.' });
        } else {
          return res.json(user);
        }
      });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* UDPATE USER */
router.put('/user-edit/:username', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    User.findOneAndUpdate(
      req.params.username, req.body
      , function (err, user) {
        if (err) return next(err);
        res.json(user);
      });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* DELETE USER */
router.delete('/user/:username', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    User.findOneAndRemove(
      req.params.username, function (err) {
        if (err) return next(err);
        res.status(200).send({ success: true, msg: 'Sucessfully deleted !' });
      });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* GET ALL FLIGHTS data */
router.get('/flights', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    Flight.find({
    }, function (err, flights) {
      if (err) return next(err);
      if (!flights) {
        res.status(401).send({ success: false, msg: 'No flights were found.' });
      } else {
        return res.json(flights);
      }
    });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* SAVE Flight */
router.post('/flight-create', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    var newFlight = new Flight({
      flight_no: req.body.flight_no,
      origin: req.body.origin,
      destination: req.body.destination,
      departuredatetime: req.body.depart_time,
      arrivaldatetime: req.body.arrival_time,
      aircraft_id: req.body.aircraft_id,
      price: req.body.price,
      carrier: req.body.carrier,
      duration: req.body.duration,
      miles: req.body.miles,
      inventory_id: req.body.inventory_id,
      equipment_id: req.body.equipment_id
    });

    newFlight.save(function (err) {
      if (err) {
        return res.status(403).send({ success: false, msg: 'Save flight failed.' });
      }
      res.json({ success: true, msg: 'Successful created new flight.' });
    });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* SAVE Multiple Flights */
router.post('/flight-bulk-create', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    var flightArray = new Array;
    for (var i = 0; i < 999; i++) {
      var newFlight = new Flight({
        flight_no: req.body.flight_no,
        origin: req.body.origin,
        destination: req.body.destination,
        departuredatetime: moment(req.body.depart_time).add(i, 'days'),
        arrivaldatetime: moment(req.body.arrival_time).add(i, 'days'),
        aircraft_id: req.body.aircraft_id,
        price: req.body.price,
        carrier: req.body.carrier,
        duration: req.body.duration,
        miles: req.body.miles,
        inventory_id: req.body.inventory_id,
        equipment_id: req.body.equipment_id
      });
      flightArray.push(newFlight);
    }

    flightArray.insertMany(function (err) {
      if (err) {
        return res.status(403).send({ success: false, msg: 'Save flight failed.' });
      }
      res.json({ success: true, msg: 'Successful created new flight.' });
    });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* GET SINGLE FLIGHT BY ID */
router.get('/flight-detail/:flight_no', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    Flight.find(
      { flight_no: req.params.flight_no }
      , function (err, flight) {
        if (err) return next(err);
        if (!flight) {
          res.status(403).send({ success: false, msg: 'Search failed. Flight not found.' });
        } else {
          return res.json(flight);
        }
      });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* UDPATE FLIGHT */
router.put('/flight-edit/:flight_no', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    Flight.findOneAndUpdate(
      req.params.flight_no, req.body
      , function (err, flight) {
        if (err) return next(err);
        res.json(flight);
      });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* DELETE FLIGHT */
router.delete('/flight/:flight_no', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  console.log(req.params.flight_no);
  if (token) {
    Flight.findOneAndRemove(
      req.params.flight_no, function (err) {
        if (err) return next(err);
        res.status(200).send({ success: true, msg: 'Sucessfully deleted !' });
      });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* GET AIRPORTS for ADMIN && HOME */
router.get('/airports', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    Airport.find({
    }, function (err, airports) {
      if (err) return next(err);
      if (!airports) {
        res.status(401).send({ success: false, msg: 'Authentication failed!' });
      } else {
        // get the list of airports
        return res.json(airports);
      }
    });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* SAVE AIRPORT */
router.post('/airport-create', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    var newAirport = new Airport({
      airportcode: req.body.airportcode,
      airportname: req.body.airportname,
      cityname: req.body.cityname,
      countrycode: req.body.countrycode,
      countryname: req.body.countryname
    });

    newAirport.save(function (err) {
      if (err) {
        return res.json({ success: false, msg: 'Save airport failed.' });
      }
      res.json({ success: true, msg: 'Successful created new airport.' });
    });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* GET SINGLE AIRPORT BY ID */
router.get('/airport-detail/:airportcode', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    Airport.find(
      { airportcode: req.params.airportcode }
      , function (err, airport) {
        if (err) return next(err);
        if (!airport) {
          res.status(403).send({ success: false, msg: 'Search failed. Airport not found.' });
        } else {
          return res.json(airport);
        }
      });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* UDPATE AIRPORT */
router.put('/airport-edit/:airportcode', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    Airport.findOneAndUpdate(
      req.params.airportcode, req.body
      , function (err, airport) {
        if (err) return next(err);
        res.json(airport);
      });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* DELETE AIRPORT */
router.delete('/airport/:airportcode', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  console.log(req.params.airportcode);
  if (token) {
    Airport.findOneAndRemove(
      req.params.airportcode, function (err) {
        if (err) return next(err);
        res.status(200).send({ success: true, msg: 'Sucessfully deleted !' });
      });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* GET AIRCRAFTS for ADMIN*/
router.get('/aircrafts', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    Aircraft.find({
    }, function (err, aircrafts) {
      if (err) return next(err);
      if (!aircrafts) {
        res.status(401).send({ success: false, msg: 'Authentication failed!' });
      } else {
        // get the list of aircrafts
        return res.json(aircrafts);
      }
    });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* SAVE AIRCRAFT */
router.post('/aircraft-create', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    var newAircraft = new Aircraft({
      aircraft_no: req.body.aircraft_no,
      aircraft_id: req.body.aircraft_id,
      aircraftname: req.body.aircraftname,
      carrier: req.body.carrier,
      inventory_id: req.body.inventory_id,
      equipment_Id: req.body.equipment_Id
    });

    newAircraft.save(function (err) {
      if (err) {
        return res.json({ success: false, msg: 'Save aircraft failed.' });
      }
      res.json({ success: true, msg: 'Successful created new aircraft.' });
    });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* GET SINGLE AIRCRAFT BY ID */
router.get('/aircraft-detail/:aircraft_no', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    Aircraft.find(
      { aircraft_no: req.params.aircraft_no }
      , function (err, aircraft) {
        if (err) return next(err);
        if (!aircraft) {
          res.status(403).send({ success: false, msg: 'Search failed. Aircraft not found.' });
        } else {
          return res.json(aircraft);
        }
      });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* UDPATE FLIGHT */
router.put('/aircraft-edit/:aircraft_no', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    Aircraft.findOneAndUpdate(
      req.params.aircraft_no, req.body
      , function (err, aircraft) {
        if (err) return next(err);
        res.json(aircraft);
      });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* DELETE FLIGHT */
router.delete('/aircraft/:aircraft_no', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  console.log(req.params.aircraft_no);
  if (token) {
    Aircraft.findOneAndRemove(
      req.params.aircraft_no, function (err) {
        if (err) return next(err);
        res.status(200).send({ success: true, msg: 'Sucessfully deleted !' });
      });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

//********************************************** END OF ADMIN ********************************************************************************************************** */

/* GET DATA FOR Flight-search */
router.get('/flight-search', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    User.findOne({
      username: req.body.username
    }, function (err, user) {
      if (err) return next(err);
      if (!user) {
        res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
      } else {
        // get the privilege_id
        var privilege_id = user.privilege_id;
        return res.json(privilege_id);
      }
    });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* GET Flight-search RESULTS data */
router.get('/flight-search-results', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  var aggregateQuery = getAggregateQuery(req);

  console.log(aggregateQuery);

  if (token) {
    mongoose.model('Flight')
      .aggregate(aggregateQuery)
      .exec(function (err, flights) {
        if (err) {
          console.log(err);
          return next(err);
        };
        if (!flights) {
          res.status(401).send({ success: false, msg: 'Search failed. Flight not found.' });
        } else {
          return res.json(flights);
        };
      });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* GET ALL FLIGHT-TRIP-OPTIONS data */
router.get('/flight-trip-options', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    return res.sendStatus(200);
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* POST PAYMENT */
router.post('/charge', function (req, res) {
  //console.log(keySecret);
  stripe.customers.create({
    email: req.headers.email,
    card: req.headers.token,
  })
    .then(customer =>
      stripe.charges.create({
        amount: req.headers.amount,
        description: "Flight booking charge",
        currency: "usd",
        customer: customer.id,
        source: req.body.token,
        statement_descriptor: 'Flight booking charge',
        metadata: { order_id: req.headers.orderid }
      }))
    .then(charge => res.send({
      token: req.headers.token,
      card_id: charge.source.id,
      order_id: charge.metadata.order_id,
      customer_id: charge.customer,
      last4: charge.source.last4,
      brand: charge.source.brand,
      description: charge.description,
      paid_status: charge.paid,
      currency: charge.currency,
      amount: charge.amount,
      statement_description: charge.statement_descriptor,
      status: charge.status
    }
    ))
    .catch(err => {
      console.log("Error:", err);
      res.status(500).send({ error: "Purchase Failed" });
    });
});

/* SAVE Payment Card */
router.post('/paymentcard', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    var newPayment = new Payment({
      token: req.body.token,
      card_id: req.body.card_id,
      order_id: req.body.order_id,
      customer_id: req.body.customer_id,
      last4: req.body.last4,
      brand: req.body.brand,
      description: req.body.description,
      paid_status: req.body.paid_status,
      currency: req.body.currency,
      amount: req.body.amount,
      statement_description: req.body.statement_descriptor,
      status: req.body.status
    });
    newPayment.save(function (err) {
      if (err) {
        return res.json({ success: false, msg: 'Save payment cards failed.' });
      }
      res.json({ success: true, msg: 'Successful saved payment card info.' });
    });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* CREATE PNR - Flight booking */
router.post('/flight-createreservation', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    var newTravelers = new Traveler({
      username: req.body.createpnr["1"].username,
      pnrno: req.body.createpnr["0"].pnrno,
      traveler_id: req.body.createpnr["1"].traveler_id,
      travelerfirstname: req.body.createpnr["1"].travelerfirstname,
      travelermiddlename: req.body.createpnr["1"].travelermiddlename,
      travelerlastname: req.body.createpnr["1"].travelerlastname,
      traveleraddress: req.body.createpnr["1"].traveleraddress,
      travelerzipcode: req.body.createpnr["1"].travelerzipcode,
      traveleremail: req.body.createpnr["1"].traveleremail,
      travelerphone: req.body.createpnr["1"].travelerphone,
      travelerseatpreference: req.body.createpnr["1"].travelerseatpreference,
      travelerspecialservices: req.body.createpnr["1"].travelerspecialservices,
      travelermealpreference: req.body.createpnr["1"].travelermealpreference,
      needpassport: req.body.createpnr["1"].needpassport,
      passportno: req.body.createpnr["1"].passportno,
      passportissue: req.body.createpnr["1"].passportissue,
      passportexpiry: req.body.createpnr["1"].passportexpiry,
      passportissuingcountry: req.body.createpnr["1"].passportissuingcountry,
      passportcountryofcitizenship: req.body.createpnr["1"].passportcountryofcitizenship,
      passportcountryofresidence: req.body.createpnr["1"].passportcountryofresidence,
      emergencycontactfirstname: req.body.createpnr["1"].emergencycontactfirstname,
      emergencycontactmiddlename: req.body.createpnr["1"].emergencycontactmiddlename,
      emergencycontactlastname: req.body.createpnr["1"].emergencycontactlastname,
      emergencycontactaddress: req.body.createpnr["1"].emergencycontactaddress,
      emergencycontactzipcode: req.body.createpnr["1"].emergencycontactzipcode,
      emergencycontactemail: req.body.createpnr["1"].emergencycontactemail,
      emergencycontactphone: req.body.createpnr["1"].emergencycontactphone
    });
    var newReservation = new Reservation({
      pnrno: req.body.createpnr["0"].pnrno,
      total_amount: req.body.createpnr["0"].total_amount,
      card_token: req.body.createpnr["0"].card_token,
      paymentstatus: req.body.createpnr["0"].paymentstatus,
      segment_count: req.body.createpnr["0"].segment_count,
      segment_id: req.body.createpnr["0"].segment_id,
      flight_no: req.body.createpnr["0"].flight_no,
      origin: req.body.createpnr["0"].origin,
      destination: req.body.createpnr["0"].destination,
      departuredatetime: req.body.createpnr["0"].departuredatetime,
      arrivaldatetime: req.body.createpnr["0"].arrivaldatetime,
      price: req.body.createpnr["0"].price,
      cabintype: req.body.createpnr["0"].cabintype,
      seatno: req.body.createpnr["0"].seatno,
      passenger_count: req.body.createpnr["1"].passenger_count,
      traveler_id: req.body.createpnr["1"].traveler_id
    });

    //SAVE the Traveler first and THEN create the reservation
    newTravelers.save(function (err, traveler) {
      if (err) return next(err);
      if (!traveler) {
        res.status(401).send({ success: false, msg: 'Failed to save travelers !' });
      } else {
        newReservation.save(function (err, reservation) {
          if (err) return next(err);
          if (!reservation) {
            return res.json({ success: false, msg: 'Create PNR failed.' });
          }
          res.json({ success: true, msg: 'Successful created new flight reservation.', pnr: reservation.pnrno });
        });
      }
    });
  }
  else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* GET ALL FLIGHT-TRIP-CONFIRMATION data */
router.get('/flight-reservation/:pnr', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    Reservation.findOne({
      pnrno: req.params.pnr
    }, function (err, reservation) {
      if (err) return next(err);
      if (!reservation) {
        res.status(401).send({ success: false, msg: 'No reservations were found.' });
      } else {
        return res.json(reservation);
      }
    });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* GET ALL TRAVELERS data */
router.get('/flight-traveler/:traveler_id', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    Traveler.find({
      traveler_id: req.params.traveler_id
    }, function (err, travelers) {
      if (err) return next(err);
      if (!travelers) {
        res.status(401).send({ success: false, msg: 'No travelers were found.' });
      } else {
        return res.json(travelers);
      }
    });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* GET ALL PAYMENTCARDS data */
router.get('/paymentcard', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    Payment.find({
    }, function (err, cards) {
      if (err) return next(err);
      if (!cards) {
        res.status(401).send({ success: false, msg: 'No cards were found.' });
      } else {
        return res.json(cards);
      }
    });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});

/* GET PAYMENTCARD by TOEKN data */
router.get('/paymentcard/:token', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    Payment.find({
      token: req.params.token
    }, function (err, cards) {
      if (err) return next(err);
      if (!cards) {
        res.status(401).send({ success: false, msg: 'No cards were found.' });
      } else {
        return res.json(cards);
      }
    });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});


//**********************************************MISC NOT USED********************************************************************************************************** */

router.get('/activeuser/:id', passport.authenticate('jwt', { session: false }), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    User.findById(req.params._id, function (err, user) {
      if (err) return next(err);
      if (!user) {
        res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
      } else {
        return res.json(user);
      }
    });
  } else {
    return res.status(403).send({ success: false, msg: 'Unauthorized.' });
  }
});


//**********************************************COMMON FUNCTIONS********************************************************************************************************** */
getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

getAggregateQuery = function(req) {
/*   var obj1 = {
    $gte: req.query.departDateTime + 'T00:00:00.000Z',
    $lte: req.query.departDateTime + 'T23:59:59.999Z'
  };
  var obj2 = {
    $gte: req.query.arrivalDatetime + 'T00:00:00.000Z',
    $lte: req.query.arrivalDatetime + 'T23:59:59.999Z'
  };

  var myquery = (req.query.return === "true") ? ('{ "$or": [{ "origin": "' + req.query.fromcity + '", "destination": "' + req.query.tocity + '","departuredatetime": ' + JSON.stringify(obj1) + ' },'
  + '{ "origin": "' + req.query.tocity + '", "destination": "' + req.query.fromcity + '","departuredatetime": ' + JSON.stringify(obj2) + '}] } }') 
  : ('"origin":' + req.query.fromcity + ',"destination":' + req.query.tocity + ',"departuredatetime":' + JSON.stringify(obj1)) ;
 */
  if(req === null) {
    return null;
  }else{
    if(req.query.return === "true"){
      var returnQuery = [
        {
          "$match": { "$or": [{ "origin": req.query.fromcity,
                              "destination": req.query.tocity,
                              "departuredatetime": { "$gte": req.query.departDateTime + "T00:00:00.000Z", "$lte": req.query.departDateTime + "T23:59:59.999Z" }
                            },
                            { "origin": req.query.tocity,
                              "destination": req.query.fromcity,
                              "departuredatetime": { "$gte": req.query.arrivalDatetime + "T00:00:00.000Z", "$lte": req.query.arrivalDatetime + "T23:59:59.999Z" }
                            }]
                    }
        },
        {
          "$lookup": {
            "from": "inventory",
            "localField": "inventory_id",
            "foreignField": "inventory_id",
            "as": "inventory"
          }
        },
        {
          "$replaceRoot": {
            "newRoot": {
              "$mergeObjects": [{
                "$arrayElemAt": ["$inventory", 0]
              }, "$$ROOT"]
            }
          }
        },
        {
          "$project": {
            "inventory": 0
          }
        }
      ];

      return returnQuery
    } else {
      var onewayQuery = [{
                      "$match": { "origin": req.query.fromcity,
                                  "destination": req.query.tocity,
                                  "departuredatetime": { "$gte": req.query.departDateTime + "T00:00:00.000Z", "$lte": req.query.departDateTime + "T23:59:59.999Z" }
                                }
                    },
                    {
                      "$lookup": {
                        "from": "inventory",
                        "localField": "inventory_id",
                        "foreignField": "inventory_id",
                        "as": "inventory"
                      }
                    },
                    {
                      "$replaceRoot": {
                        "newRoot": {
                          "$mergeObjects": [{
                            "$arrayElemAt": ["$inventory", 0]
                          }, "$$ROOT"]
                        }
                      }
                    },
                    {
                      "$project": {
                        "inventory": 0
                      }
                    }];

                    return onewayQuery;
    }
  }
}
module.exports = router;