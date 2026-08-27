import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

import styles from "./AdminBranchesComponent.module.css";

import {
  setBranches,
  setCustomers,
  setCustomerSearch,
  setBranchSearch,
  setSelectedTab,
} from "../../store/AdminSlice";

export default function AdminBranchesComponent() {
  const dispatch = useDispatch();

  const token = localStorage.getItem("token");

  const branches = useSelector((state) => state.AdminSlice.branches);

  // =========================
  // REDUX BRANCH SEARCH
  // =========================

  const branchSearch = useSelector((state) => state.AdminSlice.branchSearch);

  const [expandedBranch, setExpandedBranch] = useState(null);

  const [branchCustomers, setBranchCustomers] = useState({});

  const [loading, setLoading] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState({});

  const [message, setMessage] = useState(null);

  // =========================
  // CREATE BRANCH
  // =========================

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [createForm, setCreateForm] = useState({
    branchCode: "",
    name: "",
    region: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    directStaffCount: 0,
    contractStaffCount: 0,
  });

  // =========================
  // EDIT BRANCH
  // =========================

  const [editingBranch, setEditingBranch] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // =========================
  // DELETE
  // =========================

  const [deletingBranch, setDeletingBranch] = useState(null);

  // =========================
  // FETCH BRANCHES
  // =========================

  useEffect(() => {
    async function fetchBranches() {
      try {
        setLoading(true);

        const res = await fetch("http://localhost:8080/api/v1/branches", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let data = null;

        try {
          data = await res.json();
        } catch {
          data = null;
        }

        if (!res.ok) {
          setMessage({
            type: "error",
            text: data?.message || "Unable to load branches.",
          });

          return;
        }

        const branchList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        dispatch(setBranches(branchList));
      } catch {
        setMessage({
          type: "error",
          text: "Network error while loading branches.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchBranches();
  }, [dispatch, token]);

  // =========================
  // FILTER BRANCHES
  // =========================

  const filteredBranches = branches.filter((branch) => {
    if (!branchSearch?.trim()) {
      return true;
    }

    return String(branch._id)
      .toLowerCase()
      .includes(branchSearch.trim().toLowerCase());
  });

  // =========================
  // BRANCH SEARCH CHANGE
  // =========================

  function handleBranchSearchChange(e) {
    dispatch(setBranchSearch(e.target.value));
  }

  // =========================
  // CREATE FORM CHANGE
  // =========================

  function handleCreateChange(e) {
    const { name, value } = e.target;

    setCreateForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // =========================
  // CREATE BRANCH
  // =========================

  async function handleCreateBranch(e) {
    e.preventDefault();

    setMessage(null);

    if (
      !createForm.branchCode.trim() ||
      !createForm.name.trim() ||
      !createForm.region
    ) {
      setMessage({
        type: "error",
        text: "Branch code, name, and region are required.",
      });

      return;
    }

    setCreating(true);

    try {
      const res = await fetch("http://localhost:8080/api/v1/branches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          branchCode: createForm.branchCode.trim(),
          name: createForm.name.trim(),
          region: createForm.region,

          address: {
            street: createForm.street.trim(),
            city: createForm.city.trim(),
            state: createForm.state.trim(),
            zip: createForm.zip.trim(),
          },

          directStaffCount: Number(createForm.directStaffCount || 0),

          contractStaffCount: Number(createForm.contractStaffCount || 0),
        }),
      });

      let data = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data?.message || "Failed to create branch.",
        });

        return;
      }

      const newBranch = data?.data || data;

      dispatch(setBranches([...branches, newBranch]));

      setMessage({
        type: "success",
        text: "Branch created successfully.",
      });

      setCreateForm({
        branchCode: "",
        name: "",
        region: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        directStaffCount: 0,
        contractStaffCount: 0,
      });

      setShowCreateForm(false);
    } catch {
      setMessage({
        type: "error",
        text: "Network error while creating branch.",
      });
    } finally {
      setCreating(false);
    }
  }

  // =========================
  // TOGGLE BRANCH
  // =========================

  async function toggleBranch(branchId) {
    if (expandedBranch === branchId) {
      setExpandedBranch(null);
      return;
    }

    setExpandedBranch(branchId);

    if (branchCustomers[branchId]) {
      return;
    }

    setLoadingCustomers((current) => ({
      ...current,
      [branchId]: true,
    }));

    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/branches/${branchId}/customers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      let data = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      console.log("Branch customers:", data);

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data?.message || "Unable to load branch customers.",
        });

        return;
      }

      const customers = Array.isArray(data?.data) ? data.data : [];

      setBranchCustomers((current) => ({
        ...current,
        [branchId]: customers,
      }));

      dispatch(setCustomers(customers));
    } catch (error) {
      console.error("Customer fetch error:", error);

      setMessage({
        type: "error",
        text: "Network error while loading customers.",
      });
    } finally {
      setLoadingCustomers((current) => ({
        ...current,
        [branchId]: false,
      }));
    }
  }

  // =========================
  // GO TO CUSTOMER
  // =========================

  function goToCustomer(customerId) {
    dispatch(setCustomerSearch(String(customerId)));
    dispatch(setSelectedTab("customers"));
  }

  // =========================
  // START EDIT
  // =========================

  function startEditing(branch) {
    setEditingBranch(branch._id);

    setEditForm({
      branchCode: branch.branchCode || "",
      name: branch.name || "",
      region: branch.region || "",
      street: branch.address?.street || "",
      city: branch.address?.city || "",
      state: branch.address?.state || "",
      zip: branch.address?.zip || "",
      directStaffCount: branch.directStaffCount || 0,
      contractStaffCount: branch.contractStaffCount || 0,
    });
  }

  // =========================
  // EDIT CHANGE
  // =========================

  function handleEditChange(e) {
    const { name, value } = e.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // =========================
  // SAVE EDIT
  // =========================

  async function handleSaveEdit(branchId) {
    setSavingEdit(true);
    setMessage(null);

    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/branches/${branchId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            branchCode: editForm.branchCode.trim(),
            name: editForm.name.trim(),
            region: editForm.region,

            address: {
              street: editForm.street.trim(),
              city: editForm.city.trim(),
              state: editForm.state.trim(),
              zip: editForm.zip.trim(),
            },

            directStaffCount: Number(editForm.directStaffCount || 0),

            contractStaffCount: Number(editForm.contractStaffCount || 0),
          }),
        },
      );

      let data = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data?.message || "Failed to update branch.",
        });

        return;
      }

      const updatedBranch = data?.data || data;

      const updatedBranches = branches.map((branch) =>
        branch._id === branchId ? updatedBranch : branch,
      );

      dispatch(setBranches(updatedBranches));

      setEditingBranch(null);

      setMessage({
        type: "success",
        text: "Branch updated successfully.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Network error while updating branch.",
      });
    } finally {
      setSavingEdit(false);
    }
  }

  // =========================
  // DELETE BRANCH
  // =========================

  async function handleDeleteBranch(branch) {
    const confirmed = window.confirm(
      `Delete ${branch.name}? This can only succeed if the branch has no customers.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingBranch(branch._id);
    setMessage(null);

    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/branches/${branch._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      let data = null;

      try {
        data = await res.json();
      } catch {
        // 204 responses have no body
      }

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data?.message || "Unable to delete branch.",
        });

        return;
      }

      dispatch(setBranches(branches.filter((item) => item._id !== branch._id)));

      setBranchCustomers((current) => {
        const updated = { ...current };

        delete updated[branch._id];

        return updated;
      });

      if (expandedBranch === branch._id) {
        setExpandedBranch(null);
      }

      // If the deleted branch was being searched,
      // clear the Redux search state.
      if (branchSearch === branch._id) {
        dispatch(setBranchSearch(""));
      }

      setMessage({
        type: "success",
        text: "Branch deleted successfully.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Network error while deleting branch.",
      });
    } finally {
      setDeletingBranch(null);
    }
  }

  // =========================
  // CLEAR SEARCH
  // =========================

  function clearBranchSearch() {
    dispatch(setBranchSearch(""));
  }

  // =========================
  // RENDER
  // =========================

  return (
    <motion.div
      className={styles.container}
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
    >
      {/* =========================
          HEADER
      ========================== */}

      <div className={styles.heading}>
        <h1>Branches</h1>

        <p>Manage branches and view customers assigned to each branch.</p>
      </div>

      {/* =========================
          BRANCH SEARCH
      ========================== */}

      <div className={styles.searchSection}>
        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            value={branchSearch || ""}
            onChange={handleBranchSearchChange}
            placeholder="Search by branch ID..."
            className={styles.searchInput}
          />

          {branchSearch && (
            <button
              type="button"
              className={styles.clearSearch}
              onClick={clearBranchSearch}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* =========================
          MESSAGE
      ========================== */}

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message.text}
            className={`${styles.message} ${
              message.type === "success" ? styles.success : styles.error
            }`}
            initial={{
              opacity: 0,
              y: -6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -6,
            }}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================
          CREATE BRANCH
      ========================== */}

      <div className={styles.createSection}>
        <button
          type="button"
          className={styles.createToggle}
          onClick={() => setShowCreateForm((current) => !current)}
        >
          <span>{showCreateForm ? "Cancel" : "+ Create New Branch"}</span>

          <motion.span
            animate={{
              rotate: showCreateForm ? 180 : 0,
            }}
          >
            ▼
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {showCreateForm && (
            <motion.form
              className={styles.createForm}
              onSubmit={handleCreateBranch}
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.25,
              }}
            >
              <h2>Create Branch</h2>

              <div className={styles.formGrid}>
                <div className={styles.formItem}>
                  <label>Branch Code *</label>

                  <input
                    name="branchCode"
                    value={createForm.branchCode}
                    onChange={handleCreateChange}
                    placeholder="BR-004"
                    disabled={creating}
                    required
                  />
                </div>

                <div className={styles.formItem}>
                  <label>Branch Name *</label>

                  <input
                    name="name"
                    value={createForm.name}
                    onChange={handleCreateChange}
                    placeholder="Springfield South Branch"
                    disabled={creating}
                    required
                  />
                </div>

                <div className={styles.formItem}>
                  <label>Region *</label>

                  <select
                    name="region"
                    value={createForm.region}
                    onChange={handleCreateChange}
                    disabled={creating}
                    required
                  >
                    <option value="">Select region</option>
                    <option value="NORTH">North</option>
                    <option value="SOUTH">South</option>
                    <option value="EAST">East</option>
                    <option value="WEST">West</option>
                  </select>
                </div>

                <div className={styles.formItem}>
                  <label>Street</label>

                  <input
                    name="street"
                    value={createForm.street}
                    onChange={handleCreateChange}
                    placeholder="100 Main St"
                    disabled={creating}
                  />
                </div>

                <div className={styles.formItem}>
                  <label>City</label>

                  <input
                    name="city"
                    value={createForm.city}
                    onChange={handleCreateChange}
                    placeholder="Springfield"
                    disabled={creating}
                  />
                </div>

                <div className={styles.formItem}>
                  <label>State</label>

                  <input
                    name="state"
                    value={createForm.state}
                    onChange={handleCreateChange}
                    placeholder="IL"
                    disabled={creating}
                  />
                </div>

                <div className={styles.formItem}>
                  <label>ZIP Code</label>

                  <input
                    name="zip"
                    value={createForm.zip}
                    onChange={handleCreateChange}
                    placeholder="62701"
                    disabled={creating}
                  />
                </div>

                <div className={styles.formItem}>
                  <label>Direct Staff Count</label>

                  <input
                    name="directStaffCount"
                    type="number"
                    min="0"
                    value={createForm.directStaffCount}
                    onChange={handleCreateChange}
                    disabled={creating}
                  />
                </div>

                <div className={styles.formItem}>
                  <label>Contract Staff Count</label>

                  <input
                    name="contractStaffCount"
                    type="number"
                    min="0"
                    value={createForm.contractStaffCount}
                    onChange={handleCreateChange}
                    disabled={creating}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create Branch"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* =========================
          LOADING
      ========================== */}

      {loading && <div className={styles.loading}>Loading branches...</div>}

      {/* =========================
          NO BRANCHES
      ========================== */}

      {!loading && branches.length === 0 && (
        <div className={styles.noBranches}>
          <h2>No branches found</h2>

          <p>Create a branch to get started.</p>
        </div>
      )}

      {/* =========================
          NO SEARCH RESULTS
      ========================== */}

      {!loading &&
        branches.length > 0 &&
        branchSearch?.trim() &&
        filteredBranches.length === 0 && (
          <div className={styles.noBranches}>
            <h2>No branch found</h2>

            <p>
              No branch matches the ID <strong>{branchSearch}</strong>.
            </p>
          </div>
        )}

      {/* =========================
          BRANCHES
      ========================== */}

      {!loading && filteredBranches.length > 0 && (
        <div className={styles.branchList}>
          {filteredBranches.map((branch, index) => {
            const isExpanded = expandedBranch === branch._id;

            const customers = branchCustomers[branch._id] || [];

            const isLoadingCustomers = loadingCustomers[branch._id];

            const isEditing = editingBranch === branch._id;

            return (
              <motion.section
                key={branch._id}
                className={styles.branch}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.05,
                }}
              >
                {/* =========================
                    BRANCH HEADER
                ========================== */}

                <div className={styles.branchHeader}>
                  <button
                    type="button"
                    className={styles.branchButton}
                    onClick={() => toggleBranch(branch._id)}
                  >
                    <div>
                      <h2>{branch.name}</h2>

                      <span>{branch._id}</span>
                    </div>

                    <div className={styles.branchHeaderRight}>
                      <motion.span
                        className={styles.chevron}
                        animate={{
                          rotate: isExpanded ? 180 : 0,
                        }}
                      >
                        ▼
                      </motion.span>
                    </div>
                  </button>

                  <div className={styles.branchActions}>
                    <button
                      type="button"
                      className={styles.editButton}
                      onClick={() => startEditing(branch)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => handleDeleteBranch(branch)}
                      disabled={deletingBranch === branch._id}
                    >
                      {deletingBranch === branch._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                {/* =========================
                    EDIT FORM
                ========================== */}

                <AnimatePresence>
                  {isEditing && (
                    <motion.div
                      className={styles.editForm}
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                    >
                      <h3>Edit Branch</h3>

                      <div className={styles.formGrid}>
                        <div className={styles.formItem}>
                          <label>Branch Code</label>

                          <input
                            name="branchCode"
                            value={editForm.branchCode}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className={styles.formItem}>
                          <label>Branch Name</label>

                          <input
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className={styles.formItem}>
                          <label>Region</label>

                          <select
                            name="region"
                            value={editForm.region}
                            onChange={handleEditChange}
                          >
                            <option value="">Select region</option>

                            <option value="NORTH">North</option>

                            <option value="SOUTH">South</option>

                            <option value="EAST">East</option>

                            <option value="WEST">West</option>
                          </select>
                        </div>

                        <div className={styles.formItem}>
                          <label>Street</label>

                          <input
                            name="street"
                            value={editForm.street}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className={styles.formItem}>
                          <label>City</label>

                          <input
                            name="city"
                            value={editForm.city}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className={styles.formItem}>
                          <label>State</label>

                          <input
                            name="state"
                            value={editForm.state}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className={styles.formItem}>
                          <label>ZIP Code</label>

                          <input
                            name="zip"
                            value={editForm.zip}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className={styles.formItem}>
                          <label>Direct Staff</label>

                          <input
                            name="directStaffCount"
                            type="number"
                            min="0"
                            value={editForm.directStaffCount}
                            onChange={handleEditChange}
                          />
                        </div>

                        <div className={styles.formItem}>
                          <label>Contract Staff</label>

                          <input
                            name="contractStaffCount"
                            type="number"
                            min="0"
                            value={editForm.contractStaffCount}
                            onChange={handleEditChange}
                          />
                        </div>
                      </div>

                      <div className={styles.editActions}>
                        <button
                          type="button"
                          className={styles.cancelButton}
                          onClick={() => setEditingBranch(null)}
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          className={styles.saveButton}
                          onClick={() => handleSaveEdit(branch._id)}
                          disabled={savingEdit}
                        >
                          {savingEdit ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* =========================
                    EXPANDED BRANCH
                ========================== */}

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      className={styles.branchDetails}
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                    >
                      {/* =========================
                          BRANCH INFO
                      ========================== */}

                      <div className={styles.infoSection}>
                        <h3>Branch Information</h3>

                        <div className={styles.infoGrid}>
                          <div className={styles.infoItem}>
                            <span>Branch ID</span>

                            <strong>{branch._id}</strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Branch Code</span>

                            <strong>{branch.branchCode}</strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Region</span>

                            <strong>{branch.region}</strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Status</span>

                            <strong
                              className={
                                branch.isActive
                                  ? styles.active
                                  : styles.inactive
                              }
                            >
                              {branch.isActive ? "Active" : "Inactive"}
                            </strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Address</span>

                            <strong>
                              {branch.address?.street || "No address"}
                            </strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Direct Staff</span>

                            <strong>{branch.directStaffCount}</strong>
                          </div>

                          <div className={styles.infoItem}>
                            <span>Contract Staff</span>

                            <strong>{branch.contractStaffCount}</strong>
                          </div>
                        </div>
                      </div>

                      {/* =========================
                          CUSTOMERS
                      ========================== */}

                      <div className={styles.customerSection}>
                        <div className={styles.customerHeader}>
                          <div>
                            <h3>Customers</h3>

                            <p>Customers assigned to this branch</p>
                          </div>

                          {!isLoadingCustomers && (
                            <span className={styles.customerCount}>
                              {customers.length}
                            </span>
                          )}
                        </div>

                        {isLoadingCustomers ? (
                          <div className={styles.loadingCustomers}>
                            Loading customers...
                          </div>
                        ) : customers.length === 0 ? (
                          <div className={styles.noCustomers}>
                            No customers found for this branch.
                          </div>
                        ) : (
                          <div className={styles.customerList}>
                            {customers.map((customer) => (
                              <button
                                key={customer._id}
                                type="button"
                                className={styles.customer}
                                onClick={() => goToCustomer(customer._id)}
                              >
                                <div className={styles.customerMain}>
                                  <strong>
                                    {customer.firstName} {customer.lastName}
                                  </strong>

                                  <span>{customer._id}</span>
                                </div>

                                <div className={styles.customerInfo}>
                                  <span>{customer.phone}</span>

                                  <span
                                    className={
                                      customer.isActive
                                        ? styles.active
                                        : styles.inactive
                                    }
                                  >
                                    {customer.isActive ? "Active" : "Inactive"}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
