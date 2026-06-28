import React from "react";
import { Header } from "./components/Header/Header";
import { SalaryPage } from "./pages/SalaryPage/SalaryPage";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentKey="salary" />
      <main className="pt-16 py-6">
        <SalaryPage />
      </main>
    </div>
  );
};

export default App;
