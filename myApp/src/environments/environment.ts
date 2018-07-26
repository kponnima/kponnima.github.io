// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  delayMs: 10000,
  PUBLISHABLE_KEY: 'pk_test_J7J2fl1kaCgksR3BZLiOpLuu',
  SECRET_KEY: 'sk_test_qBQ7uEhbyUahpxrNTf5c8ugz',
  COUNTRY_LIST: ['Australia', 'Brazil', 'Canada', 'India', 'USA']
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
//import 'zone.js/dist/zone-error';  // Included with Angular CLI.
