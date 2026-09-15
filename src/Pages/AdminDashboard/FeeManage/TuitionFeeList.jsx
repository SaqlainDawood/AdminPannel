import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";

import "./TuitionFeeList.css";

import {
  getTuitionFees,
  deleteTuitionFee,
} from "../../../services/feeService";

import TuitionFeeModal from "./TuitionFeeModal";


const TuitionFeeList = () => {

  const [fees, setFees] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editFee, setEditFee] =
    useState(null);


  // ==========================================
  // LOAD FEES
  // ==========================================

  const loadFees = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await getTuitionFees();

      console.log(
        "Tuition Fees Response:",
        response
      );

      const list =
        Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];

      setFees(list);

    } catch (err) {

      console.error(
        "Tuition fees loading error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load tuition fees."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadFees();

  }, []);


  // ==========================================
  // ADD
  // ==========================================

  const handleAdd = () => {

    setEditFee(null);
    setShowModal(true);

  };


  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (fee) => {

    setEditFee(fee);
    setShowModal(true);

  };


  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (fee) => {

    const id =
      fee?._id ||
      fee?.id;

    if (!id) {
      return;
    }


    const confirmed =
      window.confirm(
        "Are you sure you want to delete this tuition fee?"
      );

    if (!confirmed) {
      return;
    }


    try {

      setError("");

      await deleteTuitionFee(id);

      await loadFees();

    } catch (err) {

      console.error(
        "Delete tuition fee error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete tuition fee."
      );

    }
  };


  // ==========================================
  // SUCCESS
  // ==========================================

  const handleSuccess = async () => {

    setShowModal(false);
    setEditFee(null);

    await loadFees();

  };


  // ==========================================
  // GET NAME
  // ==========================================

  const getDepartmentName = (fee) => {

    const department =
      fee?.departmentId;

    if (
      typeof department ===
      "object"
    ) {

      return (
        department?.name ||
        department?.title ||
        department?.code ||
        "-"
      );

    }

    return "-";
  };


  const getDegreeClassName = (fee) => {

    const degreeClass =
      fee?.degreeClassId;

    if (
      typeof degreeClass ===
      "object"
    ) {

      return (
        degreeClass?.name ||
        degreeClass?.title ||
        degreeClass?.code ||
        "-"
      );

    }

    return "-";
  };


  const getShiftName = (fee) => {

    const shift =
      fee?.shiftId;

    if (
      typeof shift ===
      "object"
    ) {

      return (
        shift?.name ||
        shift?.title ||
        "-"
      );

    }

    return "-";
  };


  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="tuition-fee-page">

      {/* HEADER */}

      <div className="tuition-list-header">

        <div>

          <h3>
            Tuition Fees
          </h3>

          <p>
            Manage tuition fees according
            to department, degree class
            and shift.
          </p>

        </div>


        <div className="tuition-list-actions">

          <button
            type="button"
            className="tuition-refresh-btn"
            onClick={loadFees}
            disabled={loading}
          >
            <RefreshCw size={16} />

            Refresh
          </button>


          <button
            type="button"
            className="tuition-add-btn"
            onClick={handleAdd}
          >
            <Plus size={17} />

            Add Tuition Fee
          </button>

        </div>

      </div>


      {/* ERROR */}

      {error && (

        <div className="tuition-list-error">
          {error}
        </div>

      )}


      {/* TABLE */}

      <div className="tuition-table-wrapper">

        {loading ? (

          <div className="tuition-list-loading">
            Loading tuition fees...
          </div>

        ) : fees.length === 0 ? (

          <div className="tuition-empty">

            <h4>
              No Tuition Fees Found
            </h4>

            <p>
              Add your first tuition fee.
            </p>

            <button
              type="button"
              onClick={handleAdd}
            >
              <Plus size={16} />
              Add Tuition Fee
            </button>

          </div>

        ) : (

          <table className="tuition-table">

            <thead>

              <tr>

                <th>
                  Department
                </th>

                <th>
                  Degree Class
                </th>

                <th>
                  Shift
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {fees.map((fee) => {

                const id =
                  fee?._id ||
                  fee?.id;

                return (

                  <tr key={id}>

                    <td>
                      {getDepartmentName(
                        fee
                      )}
                    </td>

                    <td>
                      {getDegreeClassName(
                        fee
                      )}
                    </td>

                    <td>
                      {getShiftName(
                        fee
                      )}
                    </td>

                    <td>

                      <strong>
                        PKR{" "}
                        {Number(
                          fee?.amount || 0
                        ).toLocaleString()}
                      </strong>

                    </td>

                    <td>

                      <div className="tuition-actions">

                        <button
                          type="button"
                          className="tuition-edit-btn"
                          onClick={() =>
                            handleEdit(fee)
                          }
                          title="Edit"
                        >
                          <Pencil
                            size={16}
                          />
                        </button>


                        <button
                          type="button"
                          className="tuition-delete-btn"
                          onClick={() =>
                            handleDelete(fee)
                          }
                          title="Delete"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>

                      </div>

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        )}

      </div>


      {/* MODAL */}

      <TuitionFeeModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditFee(null);
        }}
        onSuccess={handleSuccess}
        editFee={editFee}
      />

    </div>
  );
};

export default TuitionFeeList;