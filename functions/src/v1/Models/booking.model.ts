import {FieldValue, Timestamp} from 'firebase-admin/firestore';
import {z} from 'zod';

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: string
 *       properties:
 *         type: string
 *         description: The role of the user. Demo account is used by apple and google for review and is very restricted.
 *         enum: ["user", "admin", "demo"]
 */
export const Role = z.enum(['user', 'admin', 'demo']);
export type Role = z.infer<typeof Role>;

/**
 * @swagger
 * components:
 *   schemas:
 *     BusinessUnit:
 *       type: string
 *       properties:
 *         type: string
 *         description: The business unit of the user.
 *         enum: ["user", "admin", "demo"]
 */
export const BusinessUnit = z.enum(['murray', 'tenzing', 'hawking', 'unknown']);
export type BusinessUnit = z.infer<typeof BusinessUnit>;

/**
 * @swagger
 * components:
 *   schemas:
 *     SpaceType:
 *       type: string
 *       properties:
 *         type: string
 *         description: The space type you wish to book for. Note this is used to determine if the correct function has been called as well. This cannot vary in the array of bookings.
 *         enum: ["desk", "car"]
 */
export const SpaceType = z.enum(['desk', 'car']);
export type SpaceType = z.infer<typeof SpaceType>;

/**
 * @swagger
 * components:
 *   schemas:
 *     BookingType:
 *       type: string
 *       properties:
 *          type: string
 *          description: Whether this is a personal booking or a booking for a guest. This can vary in the array.
 *          enum: ["personal", "guest"]
 */
export const BookingType = z.enum(['personal', 'guest']);
export type BookingType = z.infer<typeof BookingType>;

/**
 * @swagger
 * components:
 *   schemas:
 *     TimeSlot:
 *       type: string
 *       properties:
 *         type: string
 *         description: The timeslot for the booking being made.
 *         enum: ["am", "pm", "allDay"]
 */
export const TimeSlot = z.enum(['am', 'pm', 'allDay']);
export type TimeSlot = z.infer<typeof TimeSlot>;

/**
 * @swagger
 * components:
 *   schemas:
 *     ServerTimestamp:
 *       type: object
 *       description: The firestore timestamp at the time this field is requested. This is a UTC timestamp. NOTE - Firebase console handles display of this in a different format
 *       required:
 *         - seconds
 *         - nanoseconds
 *       properties:
 *         seconds:
 *           type: number
 *           example: 123455
 *         nanoseconds:
 *           type: number
 *           example: 323414
 */
const ServerTimestampSchema = z.custom<FieldValue>(
  data => data instanceof Timestamp,
);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - firstName
 *         - lastName
 *         - email
 *         - profilePicUrl
 *         - role
 *         - businessUnit
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: The id of the user. Matches the document ID and the Firebase Authentication User Id
 *           example: 'gresdjnfE2EN34E32MASD0'
 *         firstName:
 *           type: string
 *           description: The first name of the user.
 *           example: ANDi
 *         lastName:
 *           type: string
 *           description: The last name of the user.
 *           example: Murray
 *         email:
 *           type: string
 *           description: The users AND Digital Email address
 *           example: andi.murray@and.digital
 *         profilePicUrl:
 *           type: string
 *           description: The URL of the users google profile pic.
 *           example: "https://lh3.googleusercontent.com/a/AAcHTtcEvt8dneVSYPZ04CmyNDPA1dcK2C3b-KzZF-PY=s96-c"
 *         role:
 *           $ref: '#components/schemas/Role'
 *         businessUnit:
 *           $ref: '#components/schemas/BusinessUnit'
 *         tokens:
 *           type: array
 *           description: The google cloud messaging tokens. One for each device that the user is signed into.
 *           items:
 *             type: string
 *             example: dokKVqK6zU8vm64yJQ8IPW:APA91bHA11eQZ8q63fLp6hP7SrfB36noWEtlx2tOkwnVXXrYE1orJk_wMluUcLP0gSf7ih_7tPTCLYFwvMcuhCmFSAEwrdSqpfmn50MUyynuhJTNgR8eV-vwYzUrcJtxgtxsymKTaKxs
 *         createdAt:
 *           $ref: '#components/schemas/ServerTimestamp'
 *         updatedAt:
 *           $ref: '#components/schemas/ServerTimestamp'
 */
export const User = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  profilePicUrl: z.string(),
  role: Role,
  businessUnit: BusinessUnit,
  tokens: z.array(z.string()).optional(),
  createdAt: ServerTimestampSchema,
  updatedAt: ServerTimestampSchema,
});

export type User = z.infer<typeof User>;

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - id
 *         - date
 *         - timeSlot
 *         - bookingType
 *         - spaceType
 *         - isReserveSpace
 *         - userId
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: The id of the booking. Matches the document Id.
 *           example: 00305704-2aa6-470b-8e3e-82e9736b62e5
 *         date:
 *           type: string
 *           description: The date of the booking being made. This cannot vary in the array of bookings. It must be the same date.
 *           format: YYYY-MM-DDT-HH:mm:ssZ
 *           example: '2023-06-12T14:52:31Z'
 *         timeSlot:
 *           $ref: '#components/schemas/TimeSlot'
 *         bookingType:
 *           $ref: '#components/schemas/BookingType'
 *         spaceType:
 *           $ref: '#components/schemas/SpaceType'
 *         isReserveSpace:
 *           type: boolean
 *           description: Boolean indicating if the booking is in a reserve space (if car) or communal space (if desk)
 *           example: true
 *         userId:
 *           type: string
 *           description: The userId of the ANDi making the bookings.
 *           example: "tecdascds23423ya"
 *         createdAt:
 *           $ref: '#components/schemas/ServerTimestamp'
 *         updatedAt:
 *           $ref: '#components/schemas/ServerTimestamp'
 *         clientName:
 *           type: string
 *           description: The client name of the guest being booked in.
 *           example: "Sky"
 */
export const Booking = z.object({
  id: z.string(),
  date: z.string(),
  timeSlot: TimeSlot,
  bookingType: BookingType,
  spaceType: SpaceType,
  isReserveSpace: z.boolean(),
  userId: z.string(),
  createdAt: ServerTimestampSchema,
  updatedAt: ServerTimestampSchema,
  clientName: z.string().optional(),
});

export type Booking = z.infer<typeof Booking>;

/**
 * @swagger
 * components:
 *   schemas:
 *     BookingInput:
 *       type: object
 *       required:
 *         - date
 *         - timeSlot
 *         - bookingType
 *         - spaceType
 *         - userId
 *       properties:
 *         date:
 *           type: string
 *           description: The date of the booking being made. This cannot vary in the array of bookings. It must be the same date.
 *           format: YYYY-MM-DDT-HH:mm:ssZ
 *           example: '2023-06-12T14:52:31Z'
 *         timeSlot:
 *           $ref: '#components/schemas/TimeSlot'
 *         bookingType:
 *           $ref: '#components/schemas/BookingType'
 *         spaceType:
 *           $ref: '#components/schemas/SpaceType'
 *         userId:
 *           type: string
 *           description: The userId of the ANDi making the bookings.
 *           example: "tecdascds23423ya"
 *         clientName:
 *           type: string
 *           description: The client name of the guest being booked in.
 *           example: "Sky"
 */
export const BookingInput = z.object({
  date: z.string().datetime(),
  timeSlot: TimeSlot,
  bookingType: BookingType,
  spaceType: SpaceType,
  userId: z.string(),
  clientName: z.string().optional(),
});
export type BookingInput = z.infer<typeof BookingInput>;

/**
 * @swagger
 * components:
 *   schemas:
 *     BookingRequest:
 *       type: object
 *       required:
 *         - bookings
 *       properties:
 *         bookings:
 *           type: array
 *           items:
 *             $ref: '#components/schemas/BookingInput'
 */
export const BookingRequest = z.object({
  bookings: z.array(BookingInput),
});
export type BookingRequest = z.infer<typeof BookingRequest>;

/**
 * @swagger
 * components:
 *   schemas:
 *     DeleteBookingRequest:
 *       type: object
 *       required:
 *         - bookingIds
 *       properties:
 *         bookingIds:
 *           type: array
 *           description: An Array of bookingIds that should be
 *           items:
 *             type: string
 *             example: 00305704-2aa6-470b-8e3e-82e9736b62e5
 */
export const DeleteBookingRequest = z.object({
  bookingIds: z.array(z.string()),
});
export type DeleteBookingRequest = z.infer<typeof DeleteBookingRequest>;

/**
 * @swagger
 * components:
 *   schemas:
 *     BookingEdit:
 *       type: object
 *       required:
 *         - bookingId
 *         - newTimeSlot
 *       properties:
 *         bookingId:
 *           type: string
 *           description: The booking ID to edit
 *           example: 00305704-2aa6-470b-8e3e-82e9736b62e5
 *         newTimeSlot:
 *           description: The new timeslot to be applied to the booking.
 *           $ref: '#components/schemas/TimeSlot'
 */
export const BookingEdit = z.object({
  bookingId: z.string(),
  newTimeSlot: TimeSlot,
});
export type BookingEdit = z.infer<typeof BookingEdit>;

/**
 * @swagger
 * components:
 *   schemas:
 *     EditBookingsRequest:
 *       type: object
 *       required:
 *         - bookings
 *       properties:
 *         bookings:
 *           type: array
 *           description: An array of Booking Edits to be made
 *           items:
 *             $ref: '#components/schemas/BookingEdit'
 */
export const EditBookingsRequest = z.object({
  bookings: z.array(BookingEdit),
});
export type EditBookingsRequest = z.infer<typeof EditBookingsRequest>;

/**
 * @swagger
 * components:
 *   schemas:
 *     AllocateEmptySlots:
 *       type: object
 *       required:
 *         - date
 *       properties:
 *         date:
 *           type: string
 *           description: The date of the bookings to try allocate to empty slots.
 *           format: YYYY-MM-DDT-HH:mm:ssZ
 *           example: '2023-06-12T14:52:31Z'
 *         spaceType:
 *           $ref: '#components/schemas/SpaceType'
 *         businessUnit:
 *           $ref: '#components/schemas/BusinessUnit'
 */
export const AllocateEmptySlotsRequest = z.object({
  date: z.string(),
  spaceType: SpaceType,
  businessUnit: BusinessUnit.optional(),
});

export type AllocateEmptySlotsRequest = z.infer<
  typeof AllocateEmptySlotsRequest
>;
