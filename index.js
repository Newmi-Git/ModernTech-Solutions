import express from "express";
import dotenv from "dotenv";

import employeeRoutes from "./routes/employeeRoutes.js";

import payrollRoutes from "./routes/payrollRoutes.js";

import attendanceRoutes from "./routes/attendenceRoutes.js";

import leaveRequestRoutes from "./routes/leaverequestRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/employees", employeeRoutes);

app.use("/api/payrolls", payrollRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/leave-requests", leaveRequestRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});