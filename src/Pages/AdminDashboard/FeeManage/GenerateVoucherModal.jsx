
import React, { useState } from "react";
import {
  X,
  User,
  Calendar,
  BookOpen,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import "./GenerateVoucherModal.css";

const GenerateVoucherModal = ({ isOpen, onClose, onGenerate }) => {
  const [studentId, setStudentId] = useState("");
  const [semester, setSemester] = useState("");
  const [session, setSession] = useState("");
  const [payDueDate, setPayDueDate] = useState("");
  const [fineTypeId, setFineTypeId] = useState("");

  const [tuitionFee, setTuitionFee] = useState(true);
  const [feeTypeId, setFeeTypeId] = useState("");

  const [customFees, setCustomFees] = useState([]);

  const [customName, setCustomName] = useState("");
  const [customAmount, setCustomAmount] = useState("");

  if (!isOpen) return null;

  const addCustomFee = () => {
    if (!customName || !customAmount) return;

    setCustomFees((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: customName,
        amount: Number(customAmount),
      },
    ]);

    setCustomName("");
    setCustomAmount("");
  };

  const removeCustomFee = (id) => {
    setCustomFees((prev) =>
      prev.filter((fee) => fee.id !== id)
    );
  };

  const handleGenerate = (e) => {
    e.preventDefault();

    const items = [];

    if (tuitionFee) {
      items.push({
        type: "tuition",
      });
    }

    if (feeTypeId) {
      items.push({
        type: "feeType",
        refId: feeTypeId,
      });
    }

    customFees.forEach((fee) => {
      items.push({
        type: "custom",
        name: fee.name,
        amount: fee.amount,
      });
    });

    const voucherData = {
      studentId,
      semester,
      session,
      payDueDate,
      fineTypeId,
      items,
    };

    console.log("Voucher Payload:", voucherData);

    if (onGenerate) {
      onGenerate(voucherData);
    }

    onClose();
  };

  return (
    <div className="voucher-modal-overlay">
      <div className="voucher-modal">

        {/* Header */}
        <div className="voucher-modal-header">
          <div>
            <h3>Generate Fee Voucher</h3>
            <p>
              Create a new fee voucher for a student.
            </p>
          </div>

          <button
            type="button"
            className="voucher-close-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate}>

          {/* Student & Semester */}
          <div className="voucher-form-section">

            <div className="voucher-section-title">
              <User size={18} />
              <span>Student Information</span>
            </div>

            <div className="voucher-form-grid">

              <div className="voucher-field">
                <label>
                  Student <span>*</span>
                </label>

                <select
                  value={studentId}
                  onChange={(e) =>
                    setStudentId(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Select Student
                  </option>
                  <option value="6a79767720153a5d213edc56">
                    Muhammad Mubashir Yaseen
                  </option>
                  <option value="student-002">
                    Ali Ahmed
                  </option>
                  <option value="student-003">
                    Fatima Khan
                  </option>
                </select>
              </div>

              <div className="voucher-field">
                <label>
                  Semester <span>*</span>
                </label>

                <select
                  value={semester}
                  onChange={(e) =>
                    setSemester(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Select Semester
                  </option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>

            </div>
          </div>

          {/* Voucher Information */}
          <div className="voucher-form-section">

            <div className="voucher-section-title">
              <BookOpen size={18} />
              <span>Voucher Information</span>
            </div>

            <div className="voucher-form-grid">

              <div className="voucher-field">
                <label>
                  Session <span>*</span>
                </label>

                <select
                  value={session}
                  onChange={(e) =>
                    setSession(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Select Session
                  </option>
                  <option value="Spring">
                    Spring
                  </option>
                  <option value="Fall">
                    Fall
                  </option>
                </select>
              </div>

              <div className="voucher-field">
                <label>
                  Payment Due Date <span>*</span>
                </label>

                <div className="voucher-input-icon">
                  <Calendar size={17} />

                  <input
                    type="date"
                    value={payDueDate}
                    onChange={(e) =>
                      setPayDueDate(e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="voucher-field">
                <label>Fine Type</label>

                <select
                  value={fineTypeId}
                  onChange={(e) =>
                    setFineTypeId(e.target.value)
                  }
                >
                  <option value="">
                    Select Fine Type
                  </option>
                  <option value="6a79736020153a5d213edc53">
                    Late Payment Fine
                  </option>
                  <option value="fine-002">
                    Library Fine
                  </option>
                </select>
              </div>

            </div>
          </div>

          {/* Fee Items */}
          <div className="voucher-form-section">

            <div className="voucher-section-title">
              <FileText size={18} />
              <span>Fee Items</span>
            </div>

            {/* Tuition */}
            <label className="voucher-checkbox-item">
              <input
                type="checkbox"
                checked={tuitionFee}
                onChange={(e) =>
                  setTuitionFee(e.target.checked)
                }
              />

              <div>
                <strong>Tuition Fee</strong>
                <span>
                  Include student's tuition fee
                </span>
              </div>
            </label>

            {/* Fee Type */}
            <div className="voucher-fee-row">

              <div className="voucher-checkbox">
                <input
                  type="checkbox"
                  checked={Boolean(feeTypeId)}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      setFeeTypeId("");
                    }
                  }}
                />
              </div>

              <div className="voucher-field">
                <label>Fee Type</label>

                <select
                  value={feeTypeId}
                  onChange={(e) =>
                    setFeeTypeId(e.target.value)
                  }
                >
                  <option value="">
                    Select Fee Type
                  </option>
                  <option value="6a7967cd9c680dac971ac36d">
                    Admission Processing Fee
                  </option>
                  <option value="fee-002">
                    Examination Fee
                  </option>
                  <option value="fee-003">
                    Registration Fee
                  </option>
                </select>
              </div>

            </div>

            {/* Custom Fee */}
            <div className="voucher-custom-box">

              <div className="voucher-custom-title">
                <strong>Custom Fee</strong>
                <span>
                  Add an additional custom charge.
                </span>
              </div>

              <div className="voucher-custom-inputs">

                <input
                  type="text"
                  placeholder="Fee name e.g. Library Fine"
                  value={customName}
                  onChange={(e) =>
                    setCustomName(e.target.value)
                  }
                />

                <input
                  type="number"
                  placeholder="Amount"
                  min="0"
                  value={customAmount}
                  onChange={(e) =>
                    setCustomAmount(e.target.value)
                  }
                />

                <button
                  type="button"
                  className="voucher-add-btn"
                  onClick={addCustomFee}
                >
                  <Plus size={17} />
                  Add
                </button>

              </div>

              {/* Added Custom Fees */}
              {customFees.length > 0 && (
                <div className="voucher-custom-list">

                  {customFees.map((fee) => (
                    <div
                      className="voucher-custom-item"
                      key={fee.id}
                    >
                      <div>
                        <strong>{fee.name}</strong>
                        <span>
                          PKR{" "}
                          {fee.amount.toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeCustomFee(fee.id)
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                </div>
              )}

            </div>

          </div>

          {/* Footer */}
          <div className="voucher-modal-footer">

            <button
              type="button"
              className="voucher-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="voucher-generate-btn"
            >
              <FileText size={18} />
              Generate Voucher
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default GenerateVoucherModal;

