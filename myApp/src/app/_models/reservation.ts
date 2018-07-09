export interface Reservation {
  pnrno: string;
  total_amount: number;
  card_token: string,
  paymentstatus: string;
  segment_count: number;
  segment_id: number;
  flight_no: number;
  origin: string;
  destination: string;
  departuredatetime: string;
  arrivaldatetime: string;
  price: number;
  cabintype: string;
  seatno: string;
  passenger_count: number;
  traveler_id: string;
  travelerfirstname: string;
  travelermiddlename: string;
  travelerlastname: string;
  traveleraddress: string;
  travelerzipcode: string;
  traveleremail: string;
  travelerphone: string;
  travelerseatpreference: string;
  travelerspecialservices: string;
  travelermealpreference: string;
  needpassport: boolean;
  passportno: string;
  passportexpiry: string;
  passportissuingcountry: string;
  passportcountryofcitizenship: string;
  passportcountryofresidence: string;
  emergencycontactfirstname: string;
  emergencycontactmiddlename: string;
  emergencycontactlastname: string;
  emergencycontactaddress: string;
  emergencycontactzipcode: number;
  emergencycontactemail: string;
  emergencycontactphone: string;
}
