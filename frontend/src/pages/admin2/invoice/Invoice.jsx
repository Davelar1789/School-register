import { useState, useEffect } from "react";
import "./Invoice.modules.css";
import { useNavigate } from "react-router-dom";

const Invoice = () => {
  const navigate = useNavigate();
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [rows, setRows] = useState([
    { serialNo: 1, description: "", quantity: "", baseCost: "", totalCost: 0 },
  ]);

  useEffect(() => {
    const today = new Date();
    const formattedInvoiceDate = today.toISOString().split("T")[0];
    const due = new Date(today);
    due.setDate(due.getDate() + 30);
    const formattedDueDate = due.toISOString().split("T")[0];

    setInvoiceDate(formattedInvoiceDate);
    setDueDate(formattedDueDate);
  }, []);

  const handleRowChange = (index, key, value) => {
    const newRows = rows.map((row, rowIndex) => {
      if (index === rowIndex) {
        const updatedRow = { ...row, [key]: value };
        if (key === "quantity" || key === "baseCost") {
          updatedRow.totalCost = updatedRow.quantity * updatedRow.baseCost;
        }
        return updatedRow;
      }
      return row;
    });
    setRows(newRows);
  };

  const handleAddRow = () => {
    const newRow = {
      serialNo: rows.length + 1,
      description: "",
      quantity: "",
      baseCost: "",
      totalCost: 0,
    };
    setRows([...rows, newRow]);
  };

  const calculateTotal = () => {
    return rows.reduce((total, row) => total + row.totalCost, 0);
  };

  return (
    <div className="invoice-page flex flex-col">
      <div className="invoice-content" id="invoice-print-section">
        <main className="main-content">
          <h2>Invoice</h2>
          <div className="invoice-header">
            <div className="invoice-from">
              <label>
                Invoice From:
                <input type="text" defaultValue="Sophia Loren" />
              </label>
            </div>
            <div className="invoice-to">
              <label>
                Invoice To:
                <input type="text" defaultValue="Lazy Ltd" />
              </label>
            </div>
            <div className="invoice-dates">
              <label>
                Invoice Date:
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </label>
              <label>
                Due Date:
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </label>
            </div>
          </div>
          <div className="products-list">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Serial No.</th>
                  <th>Description</th>
                  <th className="hidden-column">Quantity</th>
                  <th>Base Cost</th>
                  <th className="hidden-column">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td>{row.serialNo}</td>
                    <td>
                      <input
                        type="text"
                        placeholder="Description"
                        value={row.description}
                        onChange={(e) =>
                          handleRowChange(index, "description", e.target.value)
                        }
                      />
                    </td>
                    <td className="hidden-column">
                      <input
                        placeholder="Quantity"
                        type="number"
                        value={row.quantity}
                        min={1}
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        placeholder="Base Cost"
                        type="number"
                        min={1}
                        value={row.baseCost}
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "baseCost",
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td className="hidden-column">{row.totalCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleAddRow} className="add-row-button">
              Add Row
            </button>
          </div>
          <div className="invoice-total">
            <p>Total: ${calculateTotal()}</p>
          </div>
        </main>
      </div>
      <div className="invoice-buttons self-end">
        <button
          onClick={() => {
            const printContent = document.getElementById(
              "invoice-print-section"
            ).innerHTML;
            document.body.innerHTML = printContent;
            window.print();
            navigate(0);
          }}
        >
          Print
        </button>
        <button>Send</button>
      </div>
    </div>
  );
};

export default Invoice;
