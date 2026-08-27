import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";

import { setSelectedTab, setBranchSearch } from "../../store/AdminSlice";

import styles from "./AdminAnalyticsComponent.module.css";

export default function AdminAnalyticsComponent() {
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();

  const [monthlyTransfers, setMonthlyTransfers] = useState([]);
  const [staffRatioData, setStaffRatioData] = useState([]);

  const [loadingTransfers, setLoadingTransfers] = useState(true);
  const [loadingStaffRatio, setLoadingStaffRatio] = useState(true);

  const [message, setMessage] = useState(null);

  // =========================
  // FETCH ANALYTICS
  // =========================

  useEffect(() => {
    async function fetchAnalytics() {
      setLoadingTransfers(true);
      setLoadingStaffRatio(true);
      setMessage(null);

      try {
        const [transferRes, staffRes] = await Promise.all([
          fetch(
            "http://localhost:8080/api/v1/branches/analytics/monthly-transfers",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),

          fetch("http://localhost:8080/api/v1/branches/analytics/staff-ratio", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        // =========================
        // MONTHLY TRANSFERS
        // =========================

        let transferData = null;

        try {
          transferData = await transferRes.json();
        } catch {
          transferData = null;
        }

        console.log("MONTHLY TRANSFER ANALYTICS:", transferData);

        if (!transferRes.ok) {
          setMessage({
            type: "error",
            text:
              transferData?.message ||
              "Unable to load monthly transfer analytics.",
          });
        } else {
          const transferList = Array.isArray(transferData)
            ? transferData
            : Array.isArray(transferData?.data)
              ? transferData.data
              : [];

          setMonthlyTransfers(transferList);
        }

        // =========================
        // STAFF RATIO
        // =========================

        let staffData = null;

        try {
          staffData = await staffRes.json();
        } catch {
          staffData = null;
        }

        console.log("STAFF RATIO ANALYTICS:", staffData);

        if (!staffRes.ok) {
          setMessage({
            type: "error",
            text: staffData?.message || "Unable to load staff ratio analytics.",
          });
        } else {
          const staffList = Array.isArray(staffData)
            ? staffData
            : Array.isArray(staffData?.data)
              ? staffData.data
              : [];

          setStaffRatioData(staffList);
        }
      } catch (error) {
        console.error("Analytics error:", error);

        setMessage({
          type: "error",
          text: "Network error while loading analytics.",
        });
      } finally {
        setLoadingTransfers(false);
        setLoadingStaffRatio(false);
      }
    }

    fetchAnalytics();
  }, [token]);

  // =========================
  // MONTH NAMES
  // =========================

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // =========================
  // GET MONTH
  // =========================

  function getMonth(item) {
    if (!item || typeof item !== "object") {
      return null;
    }

    if (
      item._id &&
      typeof item._id === "object" &&
      item._id.month !== undefined
    ) {
      const month = Number(item._id.month);

      if (Number.isFinite(month)) {
        return month;
      }
    }

    if (item.month !== undefined && item.month !== null) {
      const month = Number(item.month);

      if (Number.isFinite(month)) {
        return month;
      }
    }

    if (item.monthNumber !== undefined && item.monthNumber !== null) {
      const month = Number(item.monthNumber);

      if (Number.isFinite(month)) {
        return month;
      }
    }

    return null;
  }

  // =========================
  // GET YEAR
  // =========================

  function getYear(item) {
    if (!item || typeof item !== "object") {
      return null;
    }

    if (
      item._id &&
      typeof item._id === "object" &&
      item._id.year !== undefined
    ) {
      const year = Number(item._id.year);

      if (Number.isFinite(year)) {
        return year;
      }
    }

    if (item.year !== undefined && item.year !== null) {
      const year = Number(item.year);

      if (Number.isFinite(year)) {
        return year;
      }
    }

    return null;
  }

  // =========================
  // GET TRANSFER AMOUNT
  // =========================

  function getTransferAmount(item) {
    if (!item || typeof item !== "object") {
      return 0;
    }

    const possibleAmountFields = [
      "totalAmount",
      "totalTransferAmount",
      "transferAmount",
      "total",
      "amount",
      "volume",
      "transferVolume",
      "totalVolume",
      "sum",
    ];

    for (const field of possibleAmountFields) {
      if (item[field] !== undefined && item[field] !== null) {
        const value = Number(item[field]);

        if (Number.isFinite(value)) {
          return value;
        }
      }
    }

    return 0;
  }

  // =========================
  // FORMAT MONTH
  // =========================

  function formatMonth(item) {
    const month = getMonth(item);
    const year = getYear(item);

    if (!month || month < 1 || month > 12) {
      return "Unknown";
    }

    if (year) {
      return `${monthNames[month - 1]} ${year}`;
    }

    return monthNames[month - 1];
  }

  // =========================
  // NORMALIZED TRANSFERS
  // =========================

  const transferData = useMemo(() => {
    const grouped = {};

    monthlyTransfers.forEach((item) => {
      const month = getMonth(item);
      const year = getYear(item);
      const amount = getTransferAmount(item);

      if (!month) {
        return;
      }

      const key = `${year || "unknown"}-${month}`;

      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          monthNumber: month,
          year: year,
          month: formatMonth(item),
          amount: 0,
        };
      }

      grouped[key].amount += amount;
    });

    return Object.values(grouped).sort((a, b) => {
      if (a.year !== b.year) {
        return (a.year || 0) - (b.year || 0);
      }

      return a.monthNumber - b.monthNumber;
    });
  }, [monthlyTransfers]);

  // =========================
  // MAX TRANSFER
  // =========================

  const maxTransfer = Math.max(...transferData.map((item) => item.amount), 1);

  // =========================
  // FORMAT MONEY
  // =========================

  function formatCurrency(value) {
    return Number(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // =========================
  // STAFF RATIO
  // =========================

  function getStaffRatio(item) {
    if (!item || typeof item !== "object") {
      return null;
    }

    const possibleFields = [
      "ratio",
      "staffRatio",
      "percentage",
      "percent",
      "value",
    ];

    for (const field of possibleFields) {
      if (item[field] !== undefined && item[field] !== null) {
        const value = Number(item[field]);

        if (Number.isFinite(value)) {
          return value;
        }
      }
    }

    return null;
  }

  // =========================
  // GET BANK / BRANCH ID
  // =========================

  function getBankId(item) {
    if (!item || typeof item !== "object") {
      return null;
    }

    if (item._id !== undefined && item._id !== null) {
      if (typeof item._id === "string") {
        return item._id;
      }

      if (typeof item._id === "object" && item._id.$oid) {
        return item._id.$oid;
      }

      if (typeof item._id === "object" && item._id.toString) {
        return item._id.toString();
      }
    }

    return null;
  }

  // =========================
  // GET BRANCH NAME
  // =========================

  function getBranchName(item) {
    if (!item || typeof item !== "object") {
      return "Branch";
    }

    return (
      item.branchName ||
      item.name ||
      item.branch?.name ||
      item.branchCode ||
      "Branch"
    );
  }

  // =========================
  // GET STAFF COUNT
  // =========================

  function getStaffCount(item) {
    if (!item || typeof item !== "object") {
      return null;
    }

    const possibleFields = [
      "staffCount",
      "totalStaff",
      "staff",
      "employeeCount",
      "count",
    ];

    for (const field of possibleFields) {
      if (item[field] !== undefined && item[field] !== null) {
        const value = Number(item[field]);

        if (Number.isFinite(value)) {
          return value;
        }
      }
    }

    if (
      item.directStaffCount !== undefined &&
      item.contractStaffCount !== undefined
    ) {
      const direct = Number(item.directStaffCount);
      const contract = Number(item.contractStaffCount);

      if (Number.isFinite(direct) && Number.isFinite(contract)) {
        return direct + contract;
      }
    }

    return null;
  }

  // =========================
  // FORMAT RATIO
  // =========================

  function formatRatio(ratio) {
    if (ratio === null || ratio === undefined) {
      return "N/A";
    }

    return Number(ratio).toFixed(2);
  }

  // =========================
  // GO TO BRANCH
  // =========================

  function handleStaffBranchClick(item) {
    const branchId = getBankId(item);

    if (!branchId) {
      return;
    }

    dispatch(setBranchSearch(branchId));
    dispatch(setSelectedTab("branches"));
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
        <h1>Analytics</h1>

        <p>
          Monitor transfer activity and staffing across the banking network.
        </p>
      </div>

      {/* =========================
          MESSAGE
      ========================== */}

      {message && (
        <div
          className={`${styles.message} ${
            message.type === "success" ? styles.success : styles.error
          }`}
        >
          {message.text}
        </div>
      )}

      {/* =========================
          MONTHLY TRANSFERS
      ========================== */}

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Monthly Transfer Volume</h2>

            <p>Transfer activity across the banking network by month.</p>
          </div>
        </div>

        {loadingTransfers ? (
          <div className={styles.loading}>Loading transfer analytics...</div>
        ) : transferData.length === 0 ? (
          <div className={styles.empty}>No transfer data available.</div>
        ) : (
          <div className={styles.chart}>
            {transferData.map((item, index) => {
              const height =
                item.amount > 0
                  ? Math.max((item.amount / maxTransfer) * 100, 4)
                  : 2;

              return (
                <div key={item.id} className={styles.barWrapper}>
                  <div className={styles.barValue}>
                    {formatCurrency(item.amount)}
                  </div>

                  <div className={styles.barContainer}>
                    <motion.div
                      className={styles.bar}
                      initial={{
                        height: 0,
                      }}
                      animate={{
                        height: `${height}%`,
                      }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.08,
                        ease: "easeOut",
                      }}
                    />
                  </div>

                  <div className={styles.barLabel}>{item.month}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================
          STAFF RATIO
      ========================== */}

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Staff Ratio</h2>

            <p>
              Branches where the staff ratio exceeds the configured threshold.
            </p>
          </div>
        </div>

        {loadingStaffRatio ? (
          <div className={styles.loading}>Loading staff analytics...</div>
        ) : staffRatioData.length === 0 ? (
          <div className={styles.empty}>
            No branches currently exceed the staff ratio threshold.
          </div>
        ) : (
          <div className={styles.staffList}>
            {staffRatioData.map((item, index) => {
              const ratio = getStaffRatio(item);
              const staffCount = getStaffCount(item);
              const bankId = getBankId(item);

              return (
                <motion.button
                  key={bankId || index}
                  type="button"
                  className={styles.staffItem}
                  onClick={() => handleStaffBranchClick(item)}
                  disabled={!bankId}
                  initial={{
                    opacity: 0,
                    y: 8,
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
                  <div className={styles.staffMain}>
                    <strong>{getBranchName(item)}</strong>

                    {bankId && <span>Bank ID: {bankId}</span>}

                    {item.branchCode && (
                      <span>Branch Code: {item.branchCode}</span>
                    )}

                    {staffCount !== null && (
                      <span>{staffCount} total staff</span>
                    )}
                  </div>

                  <div className={styles.staffRight}>
                    {ratio !== null && (
                      <div className={styles.staffRatioValue}>
                        {formatRatio(ratio)}
                      </div>
                    )}

                    <span className={styles.ratioLabel}>Ratio</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </section>
    </motion.div>
  );
}
