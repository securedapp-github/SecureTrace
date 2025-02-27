import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
// import * as d3 from 'd3';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { isAddress } from "ethers";
import axios from "axios";
import { DevUrl } from "../Constants";
import btc from "../Assests/Bitcoin.png";
import { useParams } from "react-router-dom";
import Footer from "./Footer";
import algo from "../Assests/algologo1.png";
// import Navbar from './Navbar';
import cytoscape from "cytoscape";
import "jspdf-autotable";

const Visualizer = () => {
  const location = useLocation();
  const [inputValue, setInputValue] = useState(
    location.state?.inputValue || ""
  );
  const [validationMessage, setValidationMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const svgRef = useRef(null);
  const [isInputEntered, setIsInputEntered] = useState(false);
  const [isAlgorand, setIsAlgorand] = useState(false);
  const [currentPage1, setCurrentPage1] = useState(1);
  const rowsPerPage1 = 10;
  const [transfers, setTransfers] = useState([]);
  const { txHash } = useParams();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [option, setOption] = useState("");
  const [formData, setFormData] = useState({
    txhash: "",
    address: "",
    fromDate: "",
    toDate: "",
    tokens: [],
  });
  const [error, setError] = useState("");
  const [isFromSecureTransaction, setIsFromSecureTransaction] = useState(false);
  const [tokensList, setTokensList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);

  const getFilteredTransactions = (transfers, selectedTokenAddress) => {
    if (!selectedTokenAddress) return transfers;
    return transfers.filter(
      (transfer) => transfer.tokenAddress === selectedTokenAddress
    );
  };

  const totalPages1 = Math.ceil(
    getFilteredTransactions(transfers, selectedToken?.address).length /
      rowsPerPage1
  );

  const sortedTransfers = getFilteredTransactions(
    transfers,
    selectedToken?.address
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const currentRows1 = sortedTransfers.slice(
    (currentPage1 - 1) * rowsPerPage1,
    currentPage1 * rowsPerPage1
  );

  const handlePageChange1 = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages1) {
      setCurrentPage1(pageNumber);
    }
  };

  const validateWalletAddress = (address) => isAddress(address);
  const validateAlgoAddress = (address) => /^[A-Z2-7]{58}$/.test(address);
  const validateAlgoTransactionId = (id) => /^[A-Z2-7]{52}$/.test(id);
  const validateTransactionHash = (hash) => /^0x([A-Fa-f0-9]{64})$/.test(hash);

  useEffect(() => {
    setFormData({
      address: "",
      fromDate: "",
      toDate: "",
      tokens: "",
      txhash: "",
    });
    setSearchTerm("");
  }, [inputValue]);

  useEffect(() => {
    // Check if the input value is coming from the Secure Transaction page
    if (location.state && location.state.inputValue) {
      setInputValue(location.state.inputValue); // Set input value from Secure Transaction page
      setIsFromSecureTransaction(true); // Set flag to indicate the source
    }
  }, [location.state]);

  useEffect(() => {
    if (isFromSecureTransaction && inputValue) {
      handleScanClick();
      setIsFromSecureTransaction(false); // Reset flag after scan
    }
  }, [inputValue, isFromSecureTransaction]);

  const handleScanClick = async () => {
    const jwtToken = localStorage.getItem("jwt_token");

    if (!jwtToken) {
      toast.error("You need to log in to access this feature.");
      setTimeout(() => {
        navigate("/");
      }, 4000);
      return;
    }
    console.log("Search submitted!");

    const value = formData?.txhash || formData?.address || inputValue;

    if (!value) {
      setValidationMessage(
        "Invalid input. Please enter a valid wallet address, transaction hash, or Algorand address."
      );
      return;
    }

    const isAddress = validateWalletAddress(value);
    const isTxHash = validateTransactionHash(value);
    const isAlgoAddress = validateAlgoAddress(value);
    const isAlgoTxId = validateAlgoTransactionId(value);

    if (!isAddress && !isTxHash && !isAlgoAddress && !isAlgoTxId) {
      setValidationMessage(
        "Invalid input. Please enter a valid wallet address, transaction hash, or Algorand address."
      );
      return;
    }

    setLoading(true);

    try {
      let response, combinedTransfers;

      if (isAddress) {
        setIsAlgorand(false);
        console.log("Scanning Address:", value);
        console.log("Filters:", {
          fromDate: formData?.fromDate,
          toDate: formData?.toDate,
          tokens: formData?.tokens,
        });

        response = await axios.post(
          `${DevUrl}/token-transfers/`,
          {
            address: value,
            startDate: formData?.fromDate || null,
            endDate: formData?.toDate || null,
            tokenList: formData?.tokens || null,
          },
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json",
            },
          }
        );

        combinedTransfers = response.data.from.concat(response.data.to);
        setTransfers(combinedTransfers);
        renderGraph(value, combinedTransfers);
        setValidationMessage("Valid wallet address found!");
      } else if (isTxHash) {
        setIsAlgorand(false);
        console.log("Scanning Transaction Hash:", value);

        response = await axios.post(
          `${DevUrl}/fetch-transaction-details/`,
          { txhash: value },
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json",
            },
          }
        );
        setTransfers(response.data.transfers);
        renderGraphTxHash(value, response.data.transfers);
        setValidationMessage("Valid transaction hash found!");
      } else if (isAlgoAddress) {
        setIsAlgorand(true);
        console.log("Scanning Algorand Address:", value);

        response = await axios.post(
          `${DevUrl}/algo-transfers/`,
          {
            address: value,
            startDate: formData?.fromDate || null,
            endDate: formData?.toDate || null,
          },
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response.data);

        setTransfers(response.data.transfers);
        renderGraph(value, response.data.transfers);
        setValidationMessage("Valid Algorand address found!");
      } else if (isAlgoTxId) {
        setIsAlgorand(true);
        console.log("Scanning Algorand Transaction ID:", value);

        response = await axios.post(
          `${DevUrl}/algo-transaction-details/`,
          { txId: value },
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json",
            },
          }
        );

        setTransfers(response.data);
        renderGraphTxHash(value, response.data);
      }

      setIsInputEntered(!!value);
    } catch (error) {
      console.error("Error during scan:", error);
      setValidationMessage("Error retrieving data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (address, blockNum, isOutgoing, chain) => {
    console.log("Link clicked:", address, blockNum, isOutgoing, chain);
    if (validateWalletAddress(address)) {
      setLoading(true);

      try {
        const response = await axios.post(
          `${DevUrl}/token-transfers/`,
          {
            address: address,
            blockNum: blockNum,
            isOutgoing: isOutgoing,
            chain: chain,
            tokenList: formData.tokens ? formData.tokens : null,
          },
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response.data);

        const combinedTransfers = response.data.from.concat(response.data.to);
        setTransfers(combinedTransfers);
        renderGraph(address, combinedTransfers);
        setValidationMessage("Valid wallet address found!");
      } catch (error) {
        console.log("Error:", error);
        setValidationMessage("Error retrieving data.");
      }
      setLoading(false);
    } else if (validateAlgoAddress(address)) {
      console.log("Scanning Algorand Address:", address);

      const response = await axios.post(
        `${DevUrl}/algo-transfers/`,
        {
          address: address,
          timestamp: blockNum,
          isOutgoing: isOutgoing,
        },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);

      setTransfers(response.data.transfers);
      renderGraph(address, response.data.transfers);
      setValidationMessage("Valid Algorand address found!");
    } else {
      setValidationMessage(
        "Invalid input. Please enter a valid wallet address."
      );
    }
  };

  const generatePDF = async () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");

      const logo = "../Assests/securedapp-logo-light.svg";
      const date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // First page
      doc.setFillColor(4, 170, 109);
      doc.rect(0, 0, 50, doc.internal.pageSize.getHeight(), "F");
      const pageWidth = doc.internal.pageSize.getWidth();
      const rightRectWidth = pageWidth - 50;

      doc.setFillColor(255, 255, 255);
      doc.rect(50, 0, rightRectWidth, doc.internal.pageSize.getHeight(), "F");
      doc.setFontSize(10);
      doc.setFont("times", "bold");
      doc.setTextColor(100, 100, 100);

      // First page header and footer
      doc.text("SecureDapp", 185, 275);
      doc.setFont("times", "normal");
      doc.text(
        "235, 2nd & 3rd Floor, 13th Cross Rd, Indira Nagar II Stage,",
        120,
        280,
        null,
        null,
        "left"
      );
      doc.text(
        "Hoysala Nagar, Indiranagar, Bengaluru, Karnataka 560038",
        120,
        285,
        null,
        null,
        "left"
      );
      doc.text("hello@securedapp.in", 120, 290, null, null, "left");

      doc.setFontSize(12);
      doc.text(date, 170, 140);
      doc.setFontSize(50);
      doc.addImage(logo, "JPEG", 89, 108, 15, 15);
      doc.text("SecureDApp", 105, 120);
      doc.line(50, 0, 50, 300);

      // Previous code remains the same until the graph page section...

      // Second page - Graph
      doc.addPage();
      doc.setFontSize(18);
      doc.setFont("times", "bold");
      doc.text("SecureTrace Visualizer", 75, 20);
      doc.setDrawColor(4, 170, 109);
      doc.line(10, 25, 200, 25);

      // Add input value display with gray background
      // First draw the gray background rectangle
      doc.setFillColor(240, 240, 240); // Light gray color
      doc.rect(10, 33, 190, 8, "F"); // x, y, width, height, 'F' for filled

      // Add input value text
      doc.setFontSize(16);
      doc.setFont("times", "bold");

      // Calculate text width to center it
      const displayValue =
        option === "address"
          ? formData.address
          : option === "txhash"
          ? formData.txhash
          : inputValue;

      // Static part of the text
      const staticText = "Input Value: ";
      const staticTextWidth =
        (doc.getStringUnitWidth(staticText) * 16) / doc.internal.scaleFactor;

      // Dynamic part of the text (value)
      let dynamicText = displayValue;
      let dynamicTextWidth =
        (doc.getStringUnitWidth(dynamicText) * 16) / doc.internal.scaleFactor;

      // Maximum allowed width for dynamic text (gray background width - static text width - padding)
      const maxDynamicTextWidth = 190 - staticTextWidth - 20; // 20px padding

      // Truncate dynamic text if it exceeds the maximum allowed width
      if (dynamicTextWidth > maxDynamicTextWidth) {
        // Calculate the maximum number of characters that can fit
        const avgCharWidth = dynamicTextWidth / dynamicText.length;
        const maxChars = Math.floor(maxDynamicTextWidth / avgCharWidth);

        // Truncate the dynamic text and add ellipsis
        dynamicText = dynamicText.substring(0, maxChars - 3) + "...";
        dynamicTextWidth =
          (doc.getStringUnitWidth(dynamicText) * 16) / doc.internal.scaleFactor;
      }

      // Total text width
      const totalTextWidth = staticTextWidth + dynamicTextWidth;

      // Calculate starting X position to center the text
      const textX = (210 - totalTextWidth) / 2;

      // Render static text in gray
      doc.setTextColor(100, 100, 100); // Gray color for static text
      doc.text(staticText, textX, 39);

      // Render dynamic text in green-500
      doc.setTextColor(34, 197, 94); // Green-500 color (#22C55E) for dynamic text
      doc.text(dynamicText, textX + staticTextWidth, 39);

      // Reset text color for rest of the document
      doc.setTextColor(100, 100, 100);

      // Transaction Details Section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Note:", 10, 55);

      doc.setFillColor(220, 220, 220); // Darker gray background
      doc.rect(10, 60, 190, 45, "F"); // Increased height for better spacing

      // Inward Transactions
      doc.setFillColor(34, 197, 94); // Green
      doc.circle(20, 70, 4, "F"); // Draw circle
      doc.setTextColor(0, 0, 0);
      doc.text("Inward Transactions", 80, 70);

      // Outward Transactions
      doc.setFillColor(239, 68, 68); // Red
      doc.circle(20, 80, 4, "F"); // Added extra space
      doc.setTextColor(0, 0, 0);
      doc.text("Outward Transactions", 80, 80);

      // From Address
      doc.setFillColor(168, 85, 247); // Purple
      doc.circle(20, 90, 4, "F"); // Added extra space
      doc.setTextColor(0, 0, 0);
      doc.text("From Address", 80, 90);

      // To Address
      doc.setFillColor(59, 130, 246); // Blue
      doc.circle(20, 100, 4, "F"); // Added extra space
      doc.setTextColor(0, 0, 0);
      doc.text("To Address", 80, 100);

      // Graph capture
      const graphElement = document.getElementById("cy");
      if (graphElement) {
        try {
          const graphCanvas = await html2canvas(graphElement, {
            scale: 2,
            backgroundColor: "#ffffff",
            logging: false,
            useCORS: true,
          });
          const graphImage = graphCanvas.toDataURL("image/png");
          doc.addImage(graphImage, "PNG", 0, 120, 210, 100); // Moved image down
        } catch (error) {
          console.error("Error capturing graph:", error);
        }
      }

      // Add footer
      doc.setFontSize(10);
      doc.setFont("times", "bold");
      doc.setTextColor(100, 100, 100);
      doc.text(date, 175, 275);
      doc.text("SecureDapp", 10, 275);
      doc.setFont("times", "normal");
      doc.text(
        "235, 2nd & 3rd Floor, 13th Cross Rd, Indira Nagar II Stage,",
        10,
        280,
        null,
        null,
        "left"
      );
      doc.text(
        "Hoysala Nagar, Indiranagar, Bengaluru, Karnataka 560038",
        10,
        285,
        null,
        null,
        "left"
      );
      doc.text("hello@securedapp.in", 10, 290, null, null, "left");
      doc.line(10, 270, 200, 270);

      // Validate transfers data
      const displayTransfers = selectedToken
        ? getFilteredTransactions(transfers, selectedToken.address)
        : transfers;

      if (!displayTransfers || !Array.isArray(displayTransfers)) {
        console.error("Invalid transfers data:", displayTransfers);
        throw new Error("Invalid or missing transfers data");
      }

      // Function to format transfer data
      const formatTransferData = (transfer, globalIndex) => {
        if (!transfer) return null;

        return {
          sno: (globalIndex + 1).toString(),
          timestamp: transfer.timestamp
            ? new Date(transfer.timestamp).toLocaleString()
            : "N/A",
          from: transfer.from
            ? transfer.from.slice(0, 5) + "..." + transfer.from.slice(-4)
            : "N/A",
          to: transfer.to
            ? transfer.to.slice(0, 5) + "..." + transfer.to.slice(-4)
            : "N/A",
          tokenPrice: transfer.tokenPrice
            ? parseFloat(transfer.tokenPrice).toFixed(2)
            : "N/A",
          tokenName: transfer.tokenName || "N/A",
          value: transfer.value ? parseFloat(transfer.value).toFixed(2) : "N/A",
        };
      };

      // Transaction History Pages
      const rowsPerPage1 = 10;
      const totalPages = Math.ceil(displayTransfers.length / rowsPerPage1);

      for (let page = 1; page <= totalPages; page++) {
        if (page % 2 === 1) {
          doc.addPage();
          doc.setFontSize(18);
          doc.setFont("times", "bold");
          doc.text("SecureTrace Transaction History", 65, 20);
          doc.setDrawColor(4, 170, 109);
          doc.line(10, 25, 200, 25);
        }

        const startIdx = (page - 1) * rowsPerPage1;
        const endIdx = Math.min(page * rowsPerPage1, displayTransfers.length);
        const currentPageData = displayTransfers
          .slice(startIdx, endIdx)
          .map((transfer, index) =>
            formatTransferData(transfer, startIdx + index)
          )
          .filter(Boolean);

        if (currentPageData.length === 0) continue;

        // Create table element
        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        table.style.marginBottom = "20px";
        table.style.tableLayout = "fixed";

        // Add headers with reduced padding
        const headers = [
          "S.No",
          "Timestamp",
          "From",
          "To",
          "Price",
          "Token",
          "Quantity",
        ];
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        headers.forEach((header, index) => {
          const th = document.createElement("th");
          th.style.padding = "6px"; // Reduced from 8px
          th.style.backgroundColor = "#f4f4f4";
          th.style.border = "1px solid #ddd";
          th.style.fontSize = "11px"; // Reduced from 12px
          th.style.fontWeight = "bold";
          th.style.textAlign = "left";

          // Adjust column widths
          if (index === 0) {
            th.style.width = "5%"; // Slightly reduce S.No width
          } else if (index === 1) {
            th.style.width = "20%"; // Increase Timestamp width
          } else {
            th.style.width = "auto"; // Default width for other columns
          }

          th.textContent = header;
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Add data rows with reduced padding
        const tbody = document.createElement("tbody");
        const totalRows = 10; // Fixed number of rows
        for (let i = 0; i < totalRows; i++) {
          const row = document.createElement("tr");
          // Set alternating background colors
          row.style.backgroundColor = i % 2 === 0 ? "#ffffff" : "#f4f4f4";

          // Use actual data if available, otherwise create an empty row
          const transfer = currentPageData[i] || {};
          const rowData = [
            transfer.sno || "", // S.No
            transfer.timestamp || "", // Timestamp
            transfer.from || "", // From
            transfer.to || "", // To
            transfer.tokenPrice || "", // Price
            transfer.tokenName || "", // Token
            transfer.value || "", // Quantity
          ];

          rowData.forEach((cellData, cellIndex) => {
            const td = document.createElement("td");
            td.style.padding = "6px";
            td.style.fontSize = "10px";
            td.style.textAlign = cellIndex === 0 ? "center" : "left";

            // Apply white background if cell data is empty
            if (cellData === "") {
              td.style.backgroundColor = "#ffffff";
              td.style.border = "none"; // Remove border for empty cells
            } else {
              td.style.backgroundColor = i % 2 === 0 ? "#ffffff" : "#f4f4f4"; // Ensure consistent background within cells
              td.style.border = "1px solid #ddd"; // Add border for non-empty cells
            }

            // Apply green color to timestamp and tokenPrice
            if (cellIndex === 1 || cellIndex === 4) {
              td.style.color = "#22C55E"; // Green-500 color
            }

            // Leave cell blank if data is empty
            td.textContent = cellData === "" ? "" : cellData;
            row.appendChild(td);
          });
          tbody.appendChild(row);
        }
        table.appendChild(tbody);

        // Create temporary container
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.width = "800px";
        container.style.backgroundColor = "#ffffff";
        container.appendChild(table);
        document.body.appendChild(container);

        try {
          // Capture table with adjusted height
          const canvas = await html2canvas(container, {
            scale: 2,
            backgroundColor: "#ffffff",
            logging: false,
            width: 800,
            height: Math.min(600, totalRows * 40 + 40), // Slightly increase table height
            useCORS: true,
          });

          // Add table to PDF with same overall height but adjusted internal proportions
          const yPosition = page % 2 === 1 ? 35 : 150;
          const tableImage = canvas.toDataURL("image/png");
          doc.addImage(tableImage, "PNG", 10, yPosition, 190, 110); // Adjust height to 110
          document.body.removeChild(container);
        } catch (error) {
          console.error(`Error capturing table page ${page}:`, error);
          document.body.removeChild(container);
        }
      }

      // Add footer
      doc.line(10, 270, 200, 270);
      doc.setFontSize(10);
      doc.setFont("times", "bold");
      doc.setTextColor(100, 100, 100);
      doc.text(date, 175, 275);
      doc.text("SecureDapp", 10, 275);
      doc.setFont("times", "normal");
      doc.text(
        "235, 2nd & 3rd Floor, 13th Cross Rd, Indira Nagar II Stage,",
        10,
        280,
        null,
        null,
        "left"
      );
      doc.text(
        "Hoysala Nagar, Indiranagar, Bengaluru, Karnataka 560038",
        10,
        285,
        null,
        null,
        "left"
      );
      doc.text("hello@securedapp.in", 10, 290, null, null, "left");

      // Disclaimer page
      doc.addPage();

      // Add header to disclaimer page
      doc.setFontSize(10);
      doc.setFont("times", "bold");
      doc.setTextColor(100, 100, 100);
      doc.text("SecureDapp", 10, 15);
      doc.text(date, 175, 15);
      doc.setDrawColor(4, 170, 109);
      doc.line(10, 20, 200, 20);

      // Continue with disclaimer content
      doc.setFontSize(18);
      doc.setFont("times", "bold");
      doc.text("Disclaimer", 82, 35);

      const disclaimerData = [
        [
          "Intellectual Property",
          "SecureTrace is the exclusive intellectual property of SecureDapp. Unauthorized use, reproduction, or distribution is strictly prohibited.",
        ],
        [
          "Intended Use",
          "SecureTrace is designed for fraud detection and security analysis. Any other use is not authorized and may result in legal action.",
        ],
        [
          "Accuracy and Liability",
          "Information provided by SecureTrace is for reference only. SecureDapp does not guarantee accuracy and is not liable for any decisions made based on this information.",
        ],
        [
          "Ethical and Legal Compliance",
          "Users must ensure their use of SecureTrace complies with all applicable laws and ethical standards. SecureDapp is not responsible for misuse.",
        ],
        [
          "No Guaranteed Outcomes",
          "SecureTrace aids in security efforts but does not guarantee specific results. Users are responsible for applying findings appropriately.",
        ],
      ];

      doc.autoTable({
        head: [["Topic", "Description"]],
        body: disclaimerData,
        startY: 40,
        styles: { fillColor: [211, 211, 211] },
        headStyles: { fillColor: [4, 170, 109] },
      });

      // Contact section
      doc.setFontSize(18);
      doc.setFont("times", "bold");
      doc.text("Contact Us", 82, doc.previousAutoTable.finalY + 20);

      const contactData = [
        ["Email", "hello@securedapp.in"],
        ["Phone", "9606015868"],
        [
          "Address",
          "SecureDApp Solutions Pvt. Ltd. 235, 2nd & 3rd Floor,13th Cross Rd, Indira Nagar II Stage,Hoysala Nagar, Indiranagar, Bengaluru, Karnataka 560038",
        ],
        ["Website", "securedapp.io"],
        ["Business Hours", "Monday to Friday, 9 AM - 6 PM IST"],
      ];

      doc.autoTable({
        head: [["", ""]],
        body: contactData,
        startY: doc.previousAutoTable.finalY + 25,
        styles: { fillColor: [211, 211, 211] },
        headStyles: { fillColor: [4, 170, 109] },
      });

      // Add footer to disclaimer page
      doc.line(10, 270, 200, 270);
      doc.setFontSize(10);
      doc.setFont("times", "bold");
      doc.setTextColor(100, 100, 100);
      doc.text(date, 175, 275);
      doc.text("SecureDapp", 10, 275);
      doc.setFont("times", "normal");
      doc.text(
        "235, 2nd & 3rd Floor, 13th Cross Rd, Indira Nagar II Stage,",
        10,
        280,
        null,
        null,
        "left"
      );
      doc.text(
        "Hoysala Nagar, Indiranagar, Bengaluru, Karnataka 560038",
        10,
        285,
        null,
        null,
        "left"
      );
      doc.text("hello@securedapp.in", 10, 290, null, null, "left");

      // Save PDF
      doc.save(
        "SecureTrace_ Advanced AI for Blockchain Investigation & Forensic Analysis.pdf"
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleGeneratePDFClick = () => {
    setLoading(true);
    setTimeout(() => {
      generatePDF();
      setLoading(false);
    }, 10000);
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  // const tokensList = ["ETH", "BTC", "USDT", "DAI", "MATIC"];

  const handleOptionChange = (e) => {
    setOption(e.target.value);
    setFormData({
      txhash: "",
      address: "",
      fromDate: "",
      toDate: "",
      tokens: [],
    });
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateTxHash = (txhash) => {
    // Example validation: Tx Hash should be 64 characters long and hexadecimal
    const txRegex = /^[0-9a-fA-F]{64}$/;
    const algoTxRegex = /^[A-Z2-7]{52}$/;
    if (!txRegex.test(txhash) && !algoTxRegex.test(txhash)) {
      alert("Invalid Tx Hash. Ensure it is a 64-character hexadecimal string");
      return "Invalid Tx Hash. Ensure it is a 64-character hexadecimal string.";
    }
    return "";
  };

  const validateAddress = (address) => {
    // Example validation: Ethereum addresses start with '0x' and are 42 characters long
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    const algoAddressRegex = /^[A-Z2-7]{58}$/;
    if (!addressRegex.test(address) && !algoAddressRegex.test(address)) {
      return "Invalid Address. Ensure it starts with '0x' and is a valid Ethereum address.";
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation for Tx Hash
    if (option === "txhash") {
      const txhashError = validateTxHash(formData.txhash);
      if (txhashError) {
        setError(txhashError);
        return; // Stop submission if invalid
      } else {
        handleScanClick();
      }
    }

    // Validation for Address
    if (option === "address") {
      if (!inputValue.trim() && !formData.address.trim()) {
        alert("Please enter an address.");
        return;
      }

      const addressToUse = inputValue.trim() || formData.address.trim();

      const addressError = validateAddress(addressToUse);
      if (addressError) {
        setError(addressError);
        return;
      }

      setFormData((prevState) => ({
        ...prevState,
        address: addressToUse,
        fromDate: formData.fromDate ? formData.fromDate : null,
        toDate: formData.toDate === "" ? null : formData.toDate,
        tokens: formData.tokens === "" ? null : formData.tokens,
      }));
    }

    console.log("Form Submitted:", formData);
    // Update transfers display based on selected token
    const filteredTransfers = getFilteredTransactions(
      transfers,
      formData.tokens[0]
    );
    if (option === "address") {
      renderGraph(formData.address, filteredTransfers);
    } else if (option === "txhash") {
      renderGraphTxHash(formData.txhash, filteredTransfers);
    }

    handleScanClick();
    setError("");
    setIsPopupOpen(false);
  };

  useEffect(() => {
    const fetchTokens = async () => {
      // setLoading(true);
      try {
        const response5 = await axios.post(`${DevUrl}/fetch-tokens`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        });

        console.log(response5);

        // const fetchedTokens = response5.data.tokens.map(
        //   (token) => `${token.name}-${token.chain}`
        // );

        const fetchedTokens = response5.data.tokens.map((token) => ({
          name: token.name,
          address: token.address,
          chain: token.chain,
          symbol: token.symbol,
        }));

        setTokensList(fetchedTokens);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  const filteredTokens = tokensList.filter((token) =>
    token.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderGraph = (centerAddress, transactions) => {
    const elements = [];

    const shortenAddress = (address) => `${address.slice(0, 6)}...`;
    const shortenTxHash = (address) =>
      `${address.slice(0, 6)}...${address.slice(-4)}`;

    // Add the center node
    elements.push({
      data: { id: centerAddress, label: shortenAddress(centerAddress) },
      classes: "center-node",
    });

    // Add edges and other nodes
    transactions.forEach((tx) => {
      const isIncoming = tx.to.toLowerCase() === centerAddress.toLowerCase();
      const target = isIncoming ? tx.from : tx.to;

      // Add the target node if not already added
      if (!elements.some((el) => el.data.id === target)) {
        elements.push({
          data: {
            id: target,
            label: shortenAddress(target),
            txHash: tx.txHash,
            type: isIncoming ? "incoming" : "outgoing",
            chain: tx.chain,
            blockNum: isAlgorand ? tx.timestamp : tx.blockNum,
            value: tx.value * tx.tokenPrice,
          },
          classes: isIncoming ? "incoming-node" : "outgoing-node",
        });
      }
      // Add the edge
      elements.push({
        data: {
          source: centerAddress,
          target: target,
          label: shortenTxHash(tx.txHash),
          hoverLabel: tx.txHash,
          type: isIncoming ? "incoming" : "outgoing",
          chain: tx.chain,
          blockNum: isAlgorand ? tx.timestamp : tx.blockNum,
          value: tx.value * tx.tokenPrice,
        },
        classes: isIncoming ? "incoming-edge" : "outgoing-edge",
      });
    });

    // const cyContainer = document.getElementById("cy");

    // // Set the dimensions of the Cytoscape container
    // cyContainer.style.height = "600px";
    // cyContainer.style.width = "1200px";

    // const cy = cytoscape({
    //   container: cyContainer, // HTML element to attach the graph

    const cy = cytoscape({
      container: document.getElementById("cy"),
      elements: elements || [],

      style: [
        {
          selector: "node",
          style: {
            "background-color": "#40a9f3",
            label: "data(label)",
            width: 50,
            height: 50,
            "text-valign": "center",
            color: "#fff",
            "font-size": "10px",
          },
        },
        {
          selector: ".center-node",
          style: {
            "background-color": "#d6b4fc",
            width: 70,
            height: 70,
          },
        },
        {
          selector: "edge",
          style: {
            width: 1,
            "line-color": "#ddd",
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": "8px",
            "text-outline-width": 1,
            "text-outline-color": "#fff",
          },
        },
        {
          selector: ".incoming-edge",
          style: {
            "line-color": "green",
            "source-arrow-color": "green",
            "source-arrow-shape": "triangle",
          },
        },
        {
          selector: ".outgoing-edge",
          style: {
            "line-color": "red",
            "target-arrow-color": "red",
            "target-arrow-shape": "triangle",
          },
        },
      ],

      layout: {
        name: "cose",
        padding: 10,
        nodeRepulsion: 5000,
        idealEdgeLength: 50,
        edgeElasticity: 100,
      },
      wheelSensitivity: 0.2,
    });

    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.padding = "8px";
    tooltip.style.background = "lightsteelblue";
    tooltip.style.border = "1px solid #fff";
    tooltip.style.borderRadius = "8px";
    tooltip.style.pointerEvents = "none";
    tooltip.style.opacity = 0;
    document.body.appendChild(tooltip);

    // Function to show the tooltip
    const showTooltip = (content, x, y) => {
      tooltip.innerHTML = content;
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
      tooltip.style.opacity = 0.7;
    };

    // Function to hide the tooltip
    const hideTooltip = () => {
      tooltip.style.opacity = 0;
    };

    // Attach event listeners for tooltip-like behavior
    cy.on("mouseover", "node", (event) => {
      const nodeData = event.target.data();
      const { x, y } = event.renderedPosition;
      showTooltip(`Address: ${nodeData.id}`, x + 1, y + 1);
    });

    cy.on("mouseout", "node", () => {
      hideTooltip();
    });

    cy.on("mouseover", "edge", (event) => {
      const edgeData = event.target.data();
      const { x, y } = event.renderedPosition;
      showTooltip(
        `Transaction Hash: ${edgeData.hoverLabel}<br>Value: $${parseFloat(
          edgeData.value
        ).toFixed(2)}`,
        x + 10,
        y + 10
      );
    });

    cy.on("mouseout", "edge", () => {
      hideTooltip();
    });

    cy.on("click", "edge", (event) => {
      const edgeData = event.target.data();
      handleLinkClick(
        edgeData.target,
        edgeData.blockNum,
        edgeData.type === "outgoing",
        edgeData.chain
      );
      hideTooltip();
    });
  };

  // function dragged(event, d) {
  //   d.fx = event.x;
  //   d.fy = event.y;
  // }

  // function dragged(event, d) {
  //   d.fx = event.x;
  //   d.fy = event.y;
  // }

  const renderGraphTxHash = (inputTxHash, transactions) => {
    const elements = [];

    const shortenAddress = (address) =>
      `${address.slice(0, 5)}...${address.slice(-4)}`;

    transactions.forEach((tx) => {
      const source = tx.from;
      const target = tx.to;

      if (!elements.some((el) => el.data.id === source)) {
        elements.push({
          data: {
            id: source,
            label: shortenAddress(source),
            chain: tx.chain,
            blockNum: isAlgorand ? tx.timestamp : tx.blockNum,
            value: tx.value * tx.tokenPrice,
          },
          classes: "node",
        });
      }

      if (!elements.some((el) => el.data.id === target)) {
        elements.push({
          data: {
            id: target,
            label: shortenAddress(target),
            chain: tx.chain,
            blockNum: isAlgorand ? tx.timestamp : tx.blockNum,
            value: tx.value * tx.tokenPrice,
          },
          classes: "node",
        });
      }

      elements.push({
        data: {
          source: source,
          target: target,
          hoverLabel: inputTxHash,
          chain: tx.chain,
          blockNum: isAlgorand ? tx.timestamp : tx.blockNum,
          value: tx.value * tx.tokenPrice,
          label: tx.value * tx.tokenPrice,
        },
        classes: tx.type === "incoming" ? "incoming-edge" : "outgoing-edge",
      });
    });

    // const cyContainer = document.getElementById("cy");

    // Set the dimensions of the Cytoscape container
    // cyContainer.style.height = "600px";
    // cyContainer.style.width = "1200px";

    // const cy = cytoscape({
    //   container: cyContainer,
    const cy = cytoscape({
      container: document.getElementById("cy"),

      elements: elements,

      style: [
        {
          selector: "node",
          style: {
            "background-color": "#40a9f3",
            label: "data(label)",
            width: 50,
            height: 50,
            "text-valign": "center",
            color: "#fff",
            "font-size": "10px",
          },
        },
        {
          selector: ".center-node",
          style: {
            "background-color": "#d6b4fc",
            width: 70,
            height: 70,
          },
        },
        {
          selector: "edge",
          style: {
            width: 1,
            "line-color": "#ddd",
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": "8px",
            "text-outline-width": 1,
            "text-outline-color": "#fff",
          },
        },
        {
          selector: ".incoming-edge",
          style: {
            "line-color": "green",
            "source-arrow-color": "green",
            "source-arrow-shape": "triangle",
          },
        },
        {
          selector: ".outgoing-edge",
          style: {
            "line-color": "red",
            "target-arrow-color": "red",
            "target-arrow-shape": "triangle",
          },
        },
      ],

      layout: {
        name: "cose",
        padding: 10,
        nodeRepulsion: 5000,
        idealEdgeLength: 50,
        edgeElasticity: 100,
      },
      wheelSensitivity: 0.2,
    });

    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.padding = "8px";
    tooltip.style.background = "lightsteelblue";
    tooltip.style.border = "1px solid #fff";
    tooltip.style.borderRadius = "8px";
    tooltip.style.pointerEvents = "none";
    tooltip.style.opacity = 0;
    document.body.appendChild(tooltip);

    // Function to show the tooltip
    const showTooltip = (content, x, y) => {
      tooltip.innerHTML = content.replace(/\n/g, "<br>"); // Replace \n with <br>
      tooltip.style.left = `${x + 10}px`; // Adjust the x position
      tooltip.style.top = `${y + 10}px`; // Adjust the y position
      tooltip.style.opacity = 1;
    };

    // Function to hide the tooltip
    const hideTooltip = () => {
      tooltip.style.opacity = 0;
    };

    // Attach event listeners for tooltip-like behavior
    cy.on("mouseover", "node", (event) => {
      const nodeData = event.target.data();
      const { x, y } = event.renderedPosition;
      showTooltip(`Address: ${nodeData.id}`, x, y);
    });

    cy.on("mouseout", "node", () => {
      hideTooltip();
    });

    cy.on("mouseover", "edge", (event) => {
      const edgeData = event.target.data();
      const { x, y } = event.renderedPosition;
      showTooltip(
        `Transaction Hash: ${edgeData.hoverLabel}<br>Value: $${parseFloat(
          edgeData.value
        ).toFixed(2)}`,
        x,
        y
      );
    });

    cy.on("mouseout", "edge", () => {
      hideTooltip();
    });

    cy.on("tap", "node", (event) => {
      const nodeData = event.target.data();
      handleLinkClick(
        nodeData.id,
        nodeData.blockNum,
        nodeData.type,
        nodeData.chain
      );
    });

    cy.layout({
      name: "cose",
      padding: 10,
      nodeRepulsion: 5000,
      idealEdgeLength: 50,
      edgeElasticity: 100,
    }).run();
  };

  const handleTokenSelection = async (token) => {
    setSelectedToken(token);
    setIsLoading(true);
    try {
      setFormData((prev) => ({
        ...prev,
        tokens: token ? [token.address] : [],
      }));
    } catch (error) {
      console.error("Error in token selection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isInputEntered) {
      if (selectedToken) {
        const filteredTransfers = getFilteredTransactions(
          transfers,
          selectedToken.address
        );
        if (filteredTransfers.length > 0) {
          if (option === "address") {
            renderGraph(formData.address || inputValue, filteredTransfers);
          } else if (option === "txhash") {
            renderGraphTxHash(formData.txhash || inputValue, filteredTransfers);
          }
        } else {
          if (option === "address") {
            renderGraph(formData.address || inputValue, transfers);
          } else if (option === "txhash") {
            renderGraphTxHash(formData.txhash || inputValue, transfers);
          }
        }
      } else {
        if (option === "address") {
          renderGraph(formData.address || inputValue, transfers);
        } else if (option === "txhash") {
          renderGraphTxHash(formData.txhash || inputValue, transfers);
        }
      }
    }
  }, [isInputEntered, selectedToken, transfers, option, formData, inputValue]);

  useEffect(() => {
    if (currentPage1 > totalPages1 || totalPages1 === 0) {
      setCurrentPage1(1); // Reset currentPage1 if needed
    }
  }, [currentPage1, totalPages1]);

  return (
    <div className="">
      <div className="flex flex-col items-center justify-center py-10 px-4 bg-white dark:bg-[#001938]">
        {!isInputEntered && (
          <>
            <h1 className="mb-6 text-3xl font-bold text-center text-black dark:text-white">
              SecureTrace Visualizer
            </h1>
            <p className="max-w-2xl mb-10 font-semibold text-center text-gray-600 dark:text-gray-300">
              SecureTrace analyzes transaction data using blockchain forensic
              techniques, enhancing the detection of intricate patterns and
              potential vulnerabilities.
            </p>
          </>
        )}
        <div className="flex flex-col items-center w-full sm:flex-row md:max-w-4xl">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.trim())}
            placeholder="Enter tx hash or address value"
            className="w-full px-4 py-3 mb-4 border border-gray-300 shadow-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent sm:mb-0 sm:mr-4"
          />
          <div className="flex gap-4">
            <button
              onClick={handleScanClick}
              disabled={loading}
              className="w-40 px-8 py-3 font-semibold text-black transition-all duration-300 bg-green-500 shadow-md rounded-xl hover:bg-green-600"
            >
              {loading ? "Scanning..." : "Scan Now"}
            </button>
            {loading && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
                <div className="border-t-2 border-b-2 border-green-700 rounded-full animate-spin h-14 w-14"></div>
              </div>
            )}
            <button
              onClick={togglePopup}
              className="px-8 py-3 font-semibold text-black transition-all duration-300 bg-green-500 shadow-md w-44 rounded-xl hover:bg-green-600"
            >
              Advanced Scan
            </button>

            {isPopupOpen && (
              <div className="fixed inset-0 z-50 flex items-start p-2 bg-black bg-opacity-50 sm:items-center sm:justify-center sm:p-0">
                <div
                  className="bg-white w-[45%] sm:w-[85%] md:w-[75%] lg:w-[65%] xl:w-[55%] rounded-lg shadow-lg relative overflow-y-scroll ml-2 sm:mx-auto lg:mt-0 sm:mt-10 md:mt-0 mt-28"
                  style={{ maxHeight: "90vh" }}
                  id="hide-scrollbar"
                >
                  <div className="p-3 md:p-6">
                    <button
                      className="absolute text-gray-600 top-2 right-2 md:top-4 md:right-4 hover:text-gray-800"
                      onClick={togglePopup}
                    >
                      ✖
                    </button>
                    <h2 className="mb-4 text-lg font-semibold md:text-xl">
                      Advanced Scan Option
                    </h2>

                    <form onSubmit={handleSubmit} className="w-full">
                      {/* Rest of the form content remains the same */}
                      {/* ... */}
                      <div className="mb-4">
                        <label className="font-medium text-gray-700">
                          Choose Option:
                        </label>
                        <div className="flex gap-2 mt-2 md:gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="filterOption"
                              value="txhash"
                              checked={option === "txhash"}
                              onChange={handleOptionChange}
                              className="mr-2"
                            />
                            Tx Hash
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="filterOption"
                              value="address"
                              checked={option === "address"}
                              onChange={handleOptionChange}
                              className="mr-2"
                            />
                            Address
                          </label>
                        </div>
                      </div>

                      {option === "txhash" && (
                        <div className="mb-4">
                          <label className="font-medium text-gray-700">
                            Tx Hash:
                          </label>
                          <input
                            type="text"
                            name="txhash"
                            value={formData.txhash}
                            onChange={handleChange}
                            placeholder="Enter Tx Hash"
                            className="w-full p-2 mt-2 border rounded-lg md:p-3"
                          />
                        </div>
                      )}

                      {option === "address" && (
                        <>
                          <div className="mb-4">
                            <label className="font-medium text-gray-700">
                              Address:
                            </label>
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              placeholder="Enter Address"
                              className="w-full p-2 mt-2 border rounded-lg md:p-3"
                            />
                          </div>
                          <div className="mb-4">
                            <label className="font-medium text-gray-700">
                              From Date:
                            </label>
                            <input
                              type="date"
                              name="fromDate"
                              value={formData.fromDate}
                              onChange={handleChange}
                              className="w-full p-2 mt-2 border rounded-lg md:p-3"
                            />
                          </div>
                          <div className="mb-4">
                            <label className="font-medium text-gray-700">
                              To Date:
                            </label>
                            <input
                              type="date"
                              name="toDate"
                              value={formData.toDate}
                              onChange={handleChange}
                              className="w-full p-2 mt-2 border rounded-lg md:p-3"
                            />
                          </div>
                          <div className="relative mb-4">
                            <label className="font-medium text-gray-700">
                              Tokens:
                            </label>
                            <div className="mt-2">
                              {formData.tokens.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {formData.tokens.map(
                                    (tokenAddress, index) => {
                                      const token = tokensList.find(
                                        (t) => t.address === tokenAddress
                                      );

                                      return token ? (
                                        <span
                                          key={index}
                                          className="flex items-center gap-1 px-2 py-1 text-sm text-blue-800 bg-blue-100 rounded-lg md:gap-2 md:text-base"
                                        >
                                          {token.name} - {token.chain}
                                          <button
                                            onClick={() =>
                                              handleTokenSelection(token)
                                            }
                                            className="text-red-500 hover:text-red-700"
                                          >
                                            ✖
                                          </button>
                                        </span>
                                      ) : null;
                                    }
                                  )}
                                </div>
                              )}

                              <input
                                type="text"
                                placeholder="Search tokens..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 mb-2 bg-white border rounded-lg md:p-3"
                              />

                              <div className="overflow-y-auto bg-white border rounded-lg shadow-lg max-h-48">
                                {filteredTokens.length > 0 ? (
                                  filteredTokens.map((token, index) => (
                                    <div
                                      key={index}
                                      onClick={() =>
                                        handleTokenSelection(token)
                                      }
                                      className={`p-2 md:p-3 text-sm md:text-base cursor-pointer hover:bg-gray-100 ${
                                        formData.tokens.includes(token.address)
                                          ? "bg-gray-200 font-bold"
                                          : ""
                                      }`}
                                    >
                                      {token.name} - {token.chain}
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-2 text-sm text-gray-500 md:p-3 md:text-base">
                                    No tokens found
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm font-semibold text-white transition-all duration-300 bg-green-500 rounded-lg md:px-6 md:text-base hover:bg-green-600"
                        >
                          {option === "txHash" ? "Scan Now" : "Submit"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {validationMessage && (
          <p
            className={`ml-10 mt-2 ${
              validationMessage.includes("Invalid")
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {validationMessage}
          </p>
        )}
        {isInputEntered && (
          <button
            onClick={handleGeneratePDFClick}
            className="px-8 py-3 mt-2 font-semibold text-black transition-all duration-300 bg-green-500 shadow-md text w-50 rounded-xl hover:bg-green-600"
          >
            Generate PDF
          </button>
        )}
        {isInputEntered && (
          <div className="flex gap-10 lg:-ml-96 lg:mr-96 mt-14 text-2xl border rounded-md p-5 mb-5 sm:-ml-0 sm:mr-0 -ml-0 mr-0">
            <p className="bg-green-500 rounded-full relative group cursor-pointer p-2 w-6 h-6 flex items-center justify-center">
              <span className="absolute inset-0 bg-green-500 rounded-full"></span>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-lg text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100">
                Inward transactions
              </span>
            </p>
            <p className="bg-red-500 rounded-full relative group cursor-pointer p-2 w-6 h-6 flex items-center justify-center">
              <span className="absolute inset-0 bg-red-500 rounded-full"></span>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-lg text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100">
                Outward transactions
              </span>
            </p>
            <p className="bg-purple-400 rounded-full relative group cursor-pointer p-2 w-6 h-6 flex items-center justify-center">
              <span className="absolute inset-0 bg-purple-400 rounded-full"></span>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-lg text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100">
                From address
              </span>
            </p>
            <p className="bg-blue-500 rounded-full relative group cursor-pointer p-2 w-6 h-6 flex items-center justify-center">
              <span className="absolute inset-0 bg-blue-500 rounded-full"></span>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-lg text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100">
                To address
              </span>
            </p>
          </div>
        )}
        <div className="mt-5">
          <div
            id="cy"
            className="border-gray-800 rounded-md shadow-2xl h-[600px] w-[1200px]"
          ></div>
        </div>
      </div>
      <div className="bg-white dark:bg-[#001938]">
        {isInputEntered && (
          // <div className="mx-20 mt-10">
          <div id="table-container" className="pt-10 pb-20 mx-4 md:mx-32">
            <div
              className="p-6 overflow-x-hidden bg-white border border-black shadow-md rounded-xl shadow-gray-500"
              id="hide-scrollbar"
            >
              <div className="">
                <div className="flex">
                  <h3 className="mt-1 mb-4 text-2xl font-semibold">
                    Transfers
                  </h3>
                  <div className="flex items-center mb-4">
                    <button
                      className={`px-4 py-2 font-bold ${
                        currentPage1 === 1
                          ? "cursor-not-allowed opacity-50 "
                          : "cursor-pointer"
                      }`}
                      onClick={() => handlePageChange1(currentPage1 - 1)}
                      disabled={currentPage1 === 1}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 1024 1024"
                      >
                        <path
                          fill="black"
                          d="M685.248 104.704a64 64 0 0 1 0 90.496L368.448 512l316.8 316.8a64 64 0 0 1-90.496 90.496L232.704 557.248a64 64 0 0 1 0-90.496l362.048-362.048a64 64 0 0 1 90.496 0"
                        />
                      </svg>
                    </button>
                    <span className="text-xl font-bold">
                      {Math.max(1, currentPage1)} / {Math.max(1, totalPages1)}
                    </span>
                    <button
                      className={`px-4 py-2 font-bold ${
                        currentPage1 === totalPages1
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }`}
                      onClick={() => handlePageChange1(currentPage1 + 1)}
                      disabled={currentPage1 === totalPages1}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 12 24"
                      >
                        <path
                          fill="black"
                          fillRule="evenodd"
                          d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-scroll" id="hide-scrollbar">
                  <table className="w-full text-center">
                    <thead className="">
                      <tr className="h-10 text-gray-500">
                        <th className="flex items-center justify-center px-4 space-x-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            viewBox="0 0 512 512"
                          >
                            <path
                              fill="none"
                              stroke="black"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="32"
                              d="M32 144h448M112 256h288M208 368h96"
                            />
                          </svg>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="black"
                              d="M14.78 3.653a3.936 3.936 0 1 1 5.567 5.567l-3.627 3.627a3.936 3.936 0 0 1-5.88-.353a.75.75 0 0 0-1.18.928a5.436 5.436 0 0 0 8.12.486l3.628-3.628a5.436 5.436 0 1 0-7.688-7.688l-3 3a.75.75 0 0 0 1.06 1.061z"
                            />
                            <path
                              fill="black"
                              d="M7.28 11.153a3.936 3.936 0 0 1 5.88.353a.75.75 0 0 0 1.18-.928a5.436 5.436 0 0 0-8.12-.486L2.592 13.72a5.436 5.436 0 1 0 7.688 7.688l3-3a.75.75 0 1 0-1.06-1.06l-3 3a3.936 3.936 0 0 1-5.567-5.568z"
                            />
                          </svg>
                        </th>
                        <th className="px-4 ">
                          <div className="flex items-center justify-center space-x-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="1em"
                              height="1em"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="black"
                                fillRule="evenodd"
                                d="m12.6 11.503l3.891 3.891l-.848.849L11.4 12V6h1.2zM12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10m0-1.2a8.8 8.8 0 1 0 0-17.6a8.8 8.8 0 0 0 0 17.6"
                              />
                            </svg>
                            <h1>Time</h1>
                          </div>
                        </th>
                        <th className="px-6 ">
                          <div className="flex items-center justify-center space-x-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="1em"
                              height="1em"
                              viewBox="0 0 512 512"
                            >
                              <path
                                fill="none"
                                stroke="black"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="32"
                                d="M32 144h448M112 256h288M208 368h96"
                              />
                            </svg>
                            <h1>From</h1>
                          </div>
                        </th>
                        <th className="px-6">
                          <div className="flex items-center justify-center space-x-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="1em"
                              height="1em"
                              viewBox="0 0 512 512"
                            >
                              <path
                                fill="none"
                                stroke="black"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="32"
                                d="M32 144h448M112 256h288M208 368h96"
                              />
                            </svg>
                            <h1>To</h1>
                          </div>
                        </th>
                        <th className="px-4 ">
                          <div className="flex items-center justify-center space-x-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="1em"
                              height="1em"
                              viewBox="0 0 512 512"
                            >
                              <path
                                fill="none"
                                stroke="black"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="32"
                                d="M32 144h448M112 256h288M208 368h96"
                              />
                            </svg>
                            <h1>Price</h1>
                          </div>
                        </th>
                        <th className="px-4 ">
                          <div className="flex items-center justify-center space-x-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="1em"
                              height="1em"
                              viewBox="0 0 512 512"
                            >
                              <path
                                fill="none"
                                stroke="black"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="32"
                                d="M32 144h448M112 256h288M208 368h96"
                              />
                            </svg>
                            <h1>Token</h1>
                          </div>
                        </th>
                        <th className="px-4 ">
                          <div className="flex items-center justify-center space-x-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="1em"
                              height="1em"
                              viewBox="0 0 512 512"
                            >
                              <path
                                fill="none"
                                stroke="black"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="32"
                                d="M32 144h448M112 256h288M208 368h96"
                              />
                            </svg>
                            <h1>Quantity</h1>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-center">
                      {currentRows1 && currentRows1.length > 0 ? (
                        currentRows1.map((transfer, index) => {
                          const {
                            logo,
                            timestamp,
                            from,
                            to,
                            value,
                            tokenName,
                            tokenPrice,
                            blockNum,
                            chain,
                          } = transfer;
                          console.log(transfer);

                          // Determine the logo to display
                          const displayLogo =
                            transfer.logo === "https://algorand.org/logo.png"
                              ? algo
                              : transfer.logo;
                          return (
                            <tr
                              key={index}
                              className="border-t h-12 text-center bg-red-600 odd:bg-[#F4F4F4] even:bg-white px-2 py-2"
                            >
                              <td className="flex items-center justify-center px-4 mt-2">
                                {displayLogo && ( // Only render the image if displayLogo is not null
                                  <img
                                    src={displayLogo}
                                    alt={tokenName}
                                    className="rounded-full h-9"
                                  />
                                )}
                              </td>
                              <td className="px-4 text-green-500 me-3">
                                {!isAlgorand
                                  ? new Date(timestamp).toLocaleString(
                                      "en-IN",
                                      {
                                        timeZone: "Asia/Kolkata",
                                      }
                                    )
                                  : new Date(timestamp * 1000).toLocaleString(
                                      "en-IN",
                                      {
                                        timeZone: "Asia/Kolkata",
                                      }
                                    )}
                              </td>
                              <td className="px-4 me-3">
                                <button
                                  className="text-center"
                                  onClick={() =>
                                    !isAlgorand
                                      ? handleLinkClick(
                                          from,
                                          blockNum,
                                          false,
                                          chain
                                        )
                                      : handleLinkClick(
                                          from,
                                          timestamp,
                                          false,
                                          chain
                                        )
                                  }
                                >
                                  {from.slice(0, 5) + "..." + from.slice(-4)}
                                </button>
                              </td>
                              <td className="px-4 me-3">
                                <button
                                  className="text-center"
                                  onClick={() =>
                                    !isAlgorand
                                      ? handleLinkClick(
                                          to,
                                          blockNum,
                                          true,
                                          chain
                                        )
                                      : handleLinkClick(
                                          to,
                                          timestamp,
                                          true,
                                          chain
                                        )
                                  }
                                >
                                  {to.slice(0, 5) + "..." + to.slice(-4)}
                                </button>
                              </td>
                              <td className="px-4 me-3">
                                {parseFloat(tokenPrice).toFixed(2)}
                              </td>
                              <td className="px-4 me-3">{tokenName}</td>
                              <td className="px-4 me-3">
                                {parseFloat(value).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="py-4 text-center">
                            No transfers found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Visualizer;
