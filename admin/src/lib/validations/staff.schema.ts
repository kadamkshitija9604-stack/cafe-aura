import { z } from "zod";

export const staffSchema = z.object({
  employeeId: z.string().min(3, "Employee ID must be at least 3 characters").max(20),
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(7, "Please enter a valid phone number").max(20),
  photoUrl: z.string().url("Please provide a valid photo URL or upload an image").or(z.literal("")),
  position: z.string().min(2, "Position is required").max(60),
  department: z.enum([
    'Barista & Coffee',
    'Kitchen & Bakery',
    'Service & Front',
    'Management',
    'Logistics'
  ]),
  role: z.enum([
    'super_admin',
    'admin',
    'manager',
    'menu_manager',
    'staff_manager',
    'staff',
    'viewer'
  ]),
  shift: z.enum([
    'Morning (6AM - 2PM)',
    'Evening (2PM - 10PM)',
    'Full Day',
    'Flexible'
  ]),
  status: z.enum(['active', 'inactive', 'on_leave']),
  joiningDate: z.string().min(4, "Joining date is required"),
  emergencyContact: z.object({
    name: z.string().min(2, "Contact name is required"),
    relationship: z.string().min(2, "Relationship is required"),
    phone: z.string().min(7, "Contact phone is required"),
  }),
  notes: z.string().max(500).optional(),
});

export type StaffFormValues = z.infer<typeof staffSchema>;
