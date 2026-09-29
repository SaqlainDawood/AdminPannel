import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Plus } from "lucide-react";
import Voucher from "./Voucher";
import "./VoucherPage.css";

const VoucherPage = () => {
  const [showGenerate, setShowGenerate] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="voucher-page">
      {!showGenerate ? (
        <div className="voucher-home">
          <div className="voucher-home-card">
            <div className="voucher-home-icon">
              <DollarSign size={40} />
            </div>

            <h2>Fee Voucher Management</h2>
            <p>
              Generate fee vouchers for individual students, batches, or
              entire departments.
            </p>

            <button
              type="button"
              className="open-generate-btn"
              onClick={() => setShowGenerate(true)}
            >
              <Plus size={18} />
              Generate Voucher
            </button>
          </div>
        </div>
      ) : (
        <Voucher onBack={() => setShowGenerate(false)} />
      )}
    </div>
  );
};

export default VoucherPage;