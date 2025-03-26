import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";

function BillingSystem() {
  const [customer, setCustomer] = useState({ name: "", contact: "" });
  const [customerId, setCustomerId] = useState(null);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [visitHistory, setVisitHistory] = useState([]);
  const [paidAmount, setPaidAmount] = useState("");
  const [dueAmount, setDueAmount] = useState(0);
  const [dateTime, setDateTime] = useState(new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));

  const tableRef = useRef(null);
  const hotInstanceRef = useRef(null);

  useEffect(() => {
    if (!hotInstanceRef.current) {
      hotInstanceRef.current = new Handsontable(tableRef.current, {
        data: [{ srNo: 1, name: "", grossWeight: 0, wastage: 0, netWeight: 0, goldRate: 0, labRate: 0, amount: 0 }],
        colHeaders: [
          "Sr. No.",
          "Item Name",
          "Gross Wt. (g)",
          "Wastage (%)",
          "Net Wt. (g)",
          "Gold Rate (Rs./g)",
          "Lab Rate (Rs.)",
          "Amount (Rs.)"
        ],
        columns: [
          { data: "srNo", type: "numeric", readOnly: true },
          { data: "name", type: "text" },
          { data: "grossWeight", type: "numeric" },
          { data: "wastage", type: "numeric" },
          { data: "netWeight", type: "numeric", readOnly: true },
          { data: "goldRate", type: "numeric" },
          { data: "labRate", type: "numeric" },
          { data: "amount", type: "numeric", readOnly: true }
        ],
        minSpareRows: 1,
        rowHeaders: true,
        width: "100%",
        height: 300,
        licenseKey: "non-commercial-and-evaluation",
        afterChange: (changes, source) => {
          if (changes && source !== "loadData") {
            changes.forEach(([row, prop]) => {
              if (["grossWeight", "wastage", "goldRate", "labRate"].includes(prop)) {
                updatePrice(row);
              }
            });
          }
        }
      });
    }
  }, []);

  const updatePrice = (rowIndex) => {
    const hot = hotInstanceRef.current;
    const rowData = hot.getDataAtRow(rowIndex);
    const grossWeight = parseFloat(rowData[2]) || 0;
    const wastage = parseFloat(rowData[3]) || 0;
    const goldRate = parseFloat(rowData[5]) || 0;
    const labRate = parseFloat(rowData[6]) || 0;

    const netWeight = (grossWeight * wastage) / 100 + grossWeight;
    const amount = netWeight * goldRate + labRate;

    hot.setDataAtCell(rowIndex, 4, netWeight.toFixed(2));
    hot.setDataAtCell(rowIndex, 7, amount.toFixed(2));
  };

  const fetchCustomers = async (query) => {
    if (query.length < 1) {
      setCustomerSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(`https://rk-billing-backend.onrender.com/search_customer?query=${query}`);
      setCustomerSuggestions(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const selectCustomer = async (cust) => {
    setCustomerId(cust.id);
    setCustomer({ name: cust.name, contact: cust.contact });
    setCustomerSuggestions([]);
    try {
      const res = await axios.get(`https://rk-billing-backend.onrender.com/get_customer_history/${cust.id}`);
      setVisitHistory(res.data.visits || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const addCustomer = async () => {
    if (!customer.name || !customer.contact) {
      alert("Please enter both name and contact.");
      return;
    }
    try {
      const res = await axios.post("https://rk-billing-backend.onrender.com/add_customer", customer);
      alert(res.data.message);
      setCustomerId(res.data.id);
      setVisitHistory([]);
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };

  const handleNewCustomer = () => {
    setCustomer({ name: "", contact: "" });
    setCustomerId(null);
    setVisitHistory([]);
    setPaidAmount("");
    setDueAmount(0);
    setDateTime(new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
    hotInstanceRef.current.loadData([{ srNo: 1, name: "", grossWeight: 0, wastage: 0, netWeight: 0, goldRate: 0, labRate: 0, amount: 0 }]);
  };

  const saveData = async () => {
    if (!customerId) {
      alert("Please select or add a customer first.");
      return;
    }

    const tableData = hotInstanceRef.current.getData();
    let purchasedItems = [];
    let totalAmount = 0;

    tableData.forEach((row) => {
      if (row[1]) {
        purchasedItems.push(
          `Item: ${row[1]} | Gross: ${row[2]}g | Wastage: ${row[3]}% | Net: ${row[4]}g | Gold Rate: Rs.${row[5]} | Lab Rate: Rs.${row[6]} | Amount: Rs.${row[7]}`
        );
        totalAmount += parseFloat(row[7]) || 0;
      }
    });

    const paid = parseFloat(paidAmount) || 0;
    const due = totalAmount - paid;
    setDueAmount(due);

    try {
      await axios.post("https://rk-billing-backend.onrender.com/add_visit", {
        customer_id: customerId,
        purchased_items: purchasedItems,
        paid_amount: paid,
        due_amount: due
      });

      alert("Data saved successfully!");
      const res = await axios.get(`https://rk-billing-backend.onrender.com/get_customer_history/${customerId}`);
      setVisitHistory(res.data.visits);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const generateInvoice = async () => {
    if (!customerId) {
      alert("Select customer first");
      return;
    }
    try {
      const response = await axios.get(`https://rk-billing-backend.onrender.com/generate_invoice/${customerId}`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${customer.name}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error generating invoice:", error);
    }
  };

  return (
    <div style={{ position: "relative", textAlign: "center", fontWeight: "bold", padding: 20, fontFamily: "Arial, sans-serif", background: "#f9f9f9" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", backgroundImage: "repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 20px)", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 500, color: "#ddd", opacity: 0.3, userSelect: "none" }}>
          RK
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <h2 style={{ color: "#8B4513" }}>RK JEWELLERS</h2>
        <h3 style={{ color: "#555" }}>ESTIMATION BILL</h3>
        <div style={{ textAlign: "right", fontWeight: "bold", color: "#333" }}>
          Date & Time: {dateTime}
        </div>

        <div style={{ padding: 20, border: "1px solid #ccc", margin: "10px 0", backgroundColor: "#fff" }}>
          <input placeholder="Customer Name" value={customer.name} onChange={(e) => {
            setCustomer({ ...customer, name: e.target.value });
            fetchCustomers(e.target.value);
          }} style={{ marginRight: 10, padding: 5 }} />
          <input placeholder="Contact" value={customer.contact} onChange={(e) => setCustomer({ ...customer, contact: e.target.value })} style={{ marginRight: 10, padding: 5 }} />
          <button onClick={addCustomer} style={{ marginRight: 10 }}>Add Customer</button>
          <button onClick={handleNewCustomer}>Next customer</button>
        </div>

        {customerSuggestions.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {customerSuggestions.map((cust) => (
              <li key={cust.id} onClick={() => selectCustomer(cust)} style={{ cursor: "pointer", padding: 5, backgroundColor: "#eee", margin: 2 }}>
                {cust.name} - {cust.contact}
              </li>
            ))}
          </ul>
        )}

        <div ref={tableRef} style={{ marginBottom: 20 }}></div>

        <input placeholder="Paid Amount" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} style={{ padding: 5, marginBottom: 10 }} />
        <h3 style={{ color: "#d2691e" }}>Due Amount: Rs.{dueAmount}</h3>
        <button onClick={saveData} style={{ marginRight: 10 }}>Save Data</button>
        <button onClick={generateInvoice}>Generate Invoice</button>

        <h3 style={{ marginTop: 30, color: "#444" }}>Visit History</h3>
        {visitHistory.length > 0 ? (
          visitHistory.map((visit, idx) => {
            const items = visit.purchased_items.split(", ");
            const localTime = new Date(visit.date + " UTC").toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
            return (
              <div key={idx} style={{ backgroundColor: "#fff", padding: 10, margin: "10px auto", maxWidth: "80%", borderRadius: 4, border: "1px solid #ccc" }}>
                {items.map((item, i) => (
                  <p key={i} style={{ margin: 0 }}>{localTime} - {item.trim()} | Paid: Rs.{visit.paid_amount} | Due: Rs.{visit.due_amount}</p>
                ))}
              </div>
            );
          })
        ) : (
          <p>No visits recorded yet.</p>
        )}
      </div>
    </div>
  );
}

export default BillingSystem;
