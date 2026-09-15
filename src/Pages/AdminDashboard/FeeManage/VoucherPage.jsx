import React, { useState } from "react";
import GenerateVoucher from "./GenerateVoucher";
import VoucherPreview from "./VoucherPreview";
import "./VoucherPage.css";

const VoucherPage = () => {
  const [showGenerate, setShowGenerate] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [voucherData, setVoucherData] = useState(null);

  // ==========================================
  // OPEN GENERATE PAGE
  // ==========================================

  const handleOpenGenerate = () => {
    setShowGenerate(true);
    setShowPreview(false);
  };

  // ==========================================
  // BACK FROM GENERATE PAGE
  // ==========================================

  const handleBack = () => {
    setShowGenerate(false);
  };

  // ==========================================
  // API SUCCESS
  // GenerateVoucher se data yahan ayega
  // ==========================================

  const handleVoucherGenerated = (data) => {
    console.log("Voucher generated successfully:");
    console.log(data);

    setVoucherData(data);

    // Generate screen close
    setShowGenerate(false);

    // Preview open
    setShowPreview(true);
  };

  // ==========================================
  // CLOSE PREVIEW
  // ==========================================

  const handleClosePreview = () => {
    setShowPreview(false);
    setVoucherData(null);
  };

  return (
    <div className="voucher-page">

      {/* =====================================
          MAIN PAGE
      ===================================== */}

      {!showGenerate && !showPreview && (
        <div className="voucher-home">

          <div className="voucher-home-card">

            <div className="voucher-home-icon">
              <span>₹</span>
            </div>

            <h2>Fee Voucher Management</h2>

            <p>
              Generate fee vouchers for batches
              or departments.
            </p>

            <button
              type="button"
              className="open-generate-btn"
              onClick={handleOpenGenerate}
            >
              Generate Voucher
            </button>

          </div>

        </div>
      )}

      {/* =====================================
          GENERATE VOUCHER
      ===================================== */}

      {showGenerate && (
        <GenerateVoucher
          onBack={handleBack}
          onGenerate={handleVoucherGenerated}
        />
      )}

      {/* =====================================
          VOUCHER PREVIEW
      ===================================== */}

      {showPreview && voucherData && (
        <VoucherPreview
          isOpen={showPreview}
          voucherData={voucherData}
          onClose={handleClosePreview}
        />
      )}

    </div>
  );
};

export default VoucherPage;