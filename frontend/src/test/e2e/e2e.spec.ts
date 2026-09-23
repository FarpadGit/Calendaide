import { pageTests } from './pages.spec';
import { calendarTests } from './calendar.spec';
import { actionTests } from './actions.spec';
import { bookingSetup, bookingTests, bookingTeardown } from './booking.spec';

pageTests();
calendarTests();
actionTests();

bookingSetup();
bookingTests();
bookingTeardown();
