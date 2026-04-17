import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    if (!token) {
      console.log("No token found");
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEmployees(res.data);
    } catch (err) {
      console.log("Dashboard error:", err);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <h3>Total Employees: {employees.length}</h3>

      {employees.map(emp => (
        <div key={emp._id}>
          <p>{emp.name} - {emp.department}</p>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;