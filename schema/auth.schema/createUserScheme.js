const { z } = require("zod");

const authSchema = {
  register: {
    body: z
      .object({
        name: z
          .string({ required_error: "Name is required" })
          .min(2, "Name must be at least 2 characters")
          .max(100, "Name must not exceed 100 characters")
          .trim(),

        email: z
          .string({ required_error: "Email is required" })
          .email("Invalid email address")
          .toLowerCase()
          .trim(),

        password: z
          .string({ required_error: "Password is required" })
          .min(8, "Password must be at least 8 characters")
          .max(100, "Password must not exceed 100 characters")
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase, lowercase, and number"
          ),

        phone: z
          .string()
          .regex(/^\+?[\d\s-()]+$/, "Invalid phone number format")
          .optional(),
      })
      .strict(),
  },

  login: {
    body: z
      .object({
        email: z
          .string({ required_error: "Email or reg number required" })
          .email("Invalid email address")
          .min(1)
          .trim(),

        password: z.string({ required_error: "Password is required" }).min(1),
      })
      .strict(),
  },
};

module.exports = authSchema;
