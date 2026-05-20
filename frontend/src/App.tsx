import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import AddClient from "./pages/AddClient";
import Reports from "./pages/Reports";
import GenerateReport from "./pages/GenerateReport";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/new" element={<AddClient />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/new" element={<GenerateReport />} />
      </Routes>
    </Layout>
  );
}
