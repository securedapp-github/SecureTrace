import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { isAddress } from 'ethers';
import axios from 'axios';
import { DevUrl } from '../Constants';
import btc from '../Assests/Bitcoin.png';
import { useParams } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';

const Visualizer = () => {
  const [inputValue, setInputValue] = useState('');
  const [validationMessage, setValidationMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const svgRef = useRef(null);
  const [isInputEntered, setIsInputEntered] = useState(false);
  const [currentPage1, setCurrentPage1] = useState(1);
  const rowsPerPage1 = 10;
  const [transfers, setTransfers] = useState([]);
  const { txHash } = useParams();

  const handleInputChange = (e) => {
    setInputValue(e.target.value.trim());
  };

  const validateWalletAddress = (address) => isAddress(address);

  const validateTransactionHash = (hash) => /^0x([A-Fa-f0-9]{64})$/.test(hash);


  useEffect(() => {
    if (txHash) {
      setInputValue(txHash);
      handleScanClick();
    }
  }, [txHash]);

  const handleScanClick = async () => {
    const value = inputValue;

    if (validateWalletAddress(value)) {
      setLoading(true);

      try {
        const response = await axios.post(
          `${DevUrl}/token-transfers/`,
          { address: value },
          {
            headers: {
              'ngrok-skip-browser-warning': 'true',
              'Content-Type': 'application/json',
            },
          }
        );
        console.log(response.data);

        const combinedTransfers = response.data.from.concat(response.data.to);
        setTransfers(combinedTransfers);
        renderGraph(value, combinedTransfers);
        setValidationMessage('Valid wallet address found!');
        if (inputValue.length > 0) {
          setIsInputEntered(true);
        } else {
          setIsInputEntered(false);
        }
      } catch (error) {
        console.log('Error:', error);
        setValidationMessage('Error retrieving data.');
      }
      setLoading(false);
    } else if (validateTransactionHash(value)) {
      setLoading(true);

      try {
        const response = await axios.post(
          `${DevUrl}/fetch-transaction-details/`,
          { txhash: value },
          {
            headers: {
              'ngrok-skip-browser-warning': 'true',
              'Content-Type': 'application/json',
            },
          }
        );
        console.log(response.data);

        setTransfers(response.data.transfers);
        // renderGraphTxHash();
        setValidationMessage('Valid wallet address found!');
        if (inputValue.length > 0) {
          setIsInputEntered(true);
        } else {
          setIsInputEntered(false);
        }
      } catch (error) {
        console.log('Error:', error);
        setValidationMessage('Error retrieving data.');
      }
      setLoading(false);

    } else {
      setValidationMessage('Invalid input. Please enter a valid wallet address.');
    }
  };


  const totalPages1 = Math.ceil(transfers.length / rowsPerPage1);
  const sortedTransfers = transfers.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const currentRows1 = sortedTransfers.slice((currentPage1 - 1) * rowsPerPage1, currentPage1 * rowsPerPage1);
  const handlePageChange1 = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages1) {
      setCurrentPage1(pageNumber);
    }
  };


  const handleLinkClick = async (address, blockNum, isOutgoing, chain) => {
    if (validateWalletAddress(address)) {
      setLoading(true);

      try {
        const response = await axios.post(
          `${DevUrl}/token-transfers/`,
          { address: address, blockNum: blockNum, isOutgoing: isOutgoing, chain: chain },
          {
            headers: {
              'ngrok-skip-browser-warning': 'true',
              'Content-Type': 'application/json',
            },
          }
        );
        console.log(response.data);

        const combinedTransfers = response.data.from.concat(response.data.to);
        setTransfers(combinedTransfers);
        renderGraph(address, combinedTransfers);
        setValidationMessage('Valid wallet address found!');
      } catch (error) {
        console.log('Error:', error);
        setValidationMessage('Error retrieving data.');
      }
      setLoading(false);
    } else {
      setValidationMessage('Invalid input. Please enter a valid wallet address.');
    }
  };




  const renderGraph = (centerAddress, transactions) => {
    const nodes = [{ id: centerAddress, center: true }];
    const links = [];

    transactions.forEach((tx) => {
      const isIncoming = tx.to.toLowerCase() === centerAddress.toLowerCase();
      const target = isIncoming ? tx.from : tx.to;

      // Ensure the node for each transaction party exists
      if (!nodes.some(node => node.id === target)) {
        nodes.push({ id: target, type: isIncoming ? 'incoming' : 'outgoing' });
      }

      links.push({
        source: centerAddress,
        target,
        hash: tx.txHash,
        chain: tx.chain,
        blockNum: tx.blockNum,
        type: isIncoming ? 'incoming' : 'outgoing',
      });
    });

    d3.select(svgRef.current).selectAll('*').remove();

    const width = 2000;
    const height = 1000;

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(300))
      .force('charge', d3.forceManyBody().strength(-600))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX((d) => d.center ? width / 2 : d.type === 'incoming' ? width / 3 : 2 * width / 3))
      .force('y', d3.forceY(height / 2).strength(0.05));

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const linkGroups = d3.group(links, d => `${d.source}-${d.target}`);

    const generatePathData = (d, i, total) => {
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const dr = Math.sqrt(dx * dx + dy * dy);
      const curveOffset = (i - (total - 1) / 2) * 20; // Adjust the curve offset
      return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,${i % 2 === 0 ? 1 : 0} ${d.target.x},${d.target.y}`;
    };
    // Links
    const link = svg
      .append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('stroke', (d) => (d.type === 'incoming' ? 'green' : 'red'))
      .attr('stroke-width', 1)
      .attr('fill', 'none')
      .attr('d', (d, i) => {
        const group = linkGroups.get(`${d.source}-${d.target}`);
        return group.length > 1 ? generatePathData(d, i, group.length) : `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
      })
      .on('mouseover', function (event, d) {
        d3.select(this).attr('stroke', '#555');
        tooltip
          .style('opacity', 1)
          .html(`Hash: ${d.hash}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`);
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke', (d) => (d.type === 'incoming' ? 'green' : 'red'));
        tooltip.style('opacity', 0);
      })
      .on('click', function (event, d) {
        const chain = d.chain === "ethereum" ? "eth" :
          d.chain === "polygon" ? "pol" :
            d.chain === "arbitrum" ? "arb" : "opt";
        console.log(d);
        handleLinkClick(d.target.id, d.blockNum, d.type === 'incoming' ? false : true, chain);
      });

    // Nodes
    const node = svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d) => (d.center ? 35 : 30))
      .attr('fill', (d) => (d.center ? '#d6b4fc' : '#40a9f3'))  // Blue nodes for all transactions
      .call(drag(simulation))
      .on('mouseover', function (event, d) {
        d3.select(this).attr('fill', (d) => (d.center ? '#d6b4fc' : '#40a9f3'));
        tooltip
          .style('opacity', 1)
          .html(`Address: ${d.id}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`);
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', (d) => (d.center ? '#d6b4fc' : '#40a9f3'));
        tooltip.style('opacity', 0);
      });

    const text = svg
      .append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('dy', 5)
      .attr('dx', -25)
      .style('font-size', '12px')
      .text((d) => d.id.substring(0, 6) + '...');

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('text-align', 'left')
      .style('width', '500px')
      .style('padding', '8px')
      .style('font', '12px sans-serif')
      .style('background', 'lightsteelblue')
      .style('border', '1px solid #fff')
      .style('border-radius', '8px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    const showTooltip = (content, x, y) => {
      tooltip
        .html(content)
        .style('left', `${x}px`)
        .style('top', `${y}px`)
        .style('opacity', 1);
    };

    const hideTooltip = () => {
      tooltip.style('opacity', 0);
    };

    node.on('mouseover', function (event, d) {
      showTooltip(`Address: ${d.id}`, event.pageX + 10, event.pageY + 10);
    });

    document.addEventListener('click', (event) => {
      const isTooltipClick = tooltip.node().contains(event.target);
      if (!isTooltipClick) hideTooltip();
    });

    simulation.on('tick', () => {
      link.attr('d', (d, i) => {
        const group = linkGroups.get(`${d.source}-${d.target}`);
        return group.length > 1 ? generatePathData(d, i, group.length) : `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
      });
      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      text.attr('x', (d) => d.x).attr('y', (d) => d.y);
    });

    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
    }
  };

  // const renderGraphTxHash = () => {
  //   const nodes = [{ id: centerAddress, center: true }];
  //   const links = [];

  //   transactions.forEach((tx) => {
  //     const isIncoming = tx.to.toLowerCase() === centerAddress.toLowerCase();
  //     const target = isIncoming ? tx.from : tx.to;

  //     // Ensure the node for each transaction party exists
  //     if (!nodes.some(node => node.id === target)) {
  //       nodes.push({ id: target, type: isIncoming ? 'incoming' : 'outgoing' });
  //     }

  //     links.push({
  //       source: centerAddress,
  //       target,
  //       blockNum: tx.blockNum,
  //       type: isIncoming ? 'incoming' : 'outgoing',
  //     });
  //   });

  //   d3.select(svgRef.current).selectAll('*').remove();

  //   const width = 2000;
  //   const height = 1000;

  //   const simulation = d3
  //     .forceSimulation(nodes)
  //     .force('link', d3.forceLink(links).id((d) => d.id).distance(300))
  //     .force('charge', d3.forceManyBody().strength(-600))
  //     .force('center', d3.forceCenter(width / 2, height / 2))
  //     .force('x', d3.forceX((d) => d.center ? width / 2 : d.type === 'incoming' ? width / 3 : 2 * width / 3))
  //     .force('y', d3.forceY(height / 2).strength(0.05));

  //   const svg = d3
  //     .select(svgRef.current)
  //     .attr('width', width)
  //     .attr('height', height);

  //   const linkGroups = d3.group(links, d => `${d.source}-${d.target}`);

  //   const generatePathData = (d, i, total) => {
  //     const dx = d.target.x - d.source.x;
  //     const dy = d.target.y - d.source.y;
  //     const dr = Math.sqrt(dx * dx + dy * dy);
  //     const curveOffset = (i - (total - 1) / 2) * 20; // Adjust the curve offset
  //     return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,${i % 2 === 0 ? 1 : 0} ${d.target.x},${d.target.y}`;
  //   };
  //   // Links
  //   const link = svg
  //     .append('g')
  //     .attr('class', 'links')
  //     .selectAll('path')
  //     .data(links)
  //     .enter()
  //     .append('path')
  //     .attr('stroke', (d) => (d.type === 'incoming' ? 'green' : 'red'))
  //     .attr('stroke-width', 1)
  //     .attr('fill', 'none')
  //     .attr('d', (d, i) => {
  //       const group = linkGroups.get(`${d.source}-${d.target}`);
  //       return group.length > 1 ? generatePathData(d, i, group.length) : `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
  //     })
  //     .on('mouseover', function (event, d) {
  //       d3.select(this).attr('stroke', '#555');
  //       tooltip
  //         .style('opacity', 1)
  //         .html(`Hash: ${d.hash}`)
  //         .style('left', `${event.pageX + 10}px`)
  //         .style('top', `${event.pageY + 10}px`);
  //     })
  //     .on('mouseout', function () {
  //       d3.select(this).attr('stroke', (d) => (d.type === 'incoming' ? 'green' : 'red'));
  //       tooltip.style('opacity', 0);
  //     })
  //     .on('click', function (event, d) {
  //       console.log(d);
  //       handleLinkClick(d.target.id, d.blockNum, d.type === 'incoming' ? false : true);
  //     });

  //   // Nodes
  //   const node = svg
  //     .append('g')
  //     .attr('class', 'nodes')
  //     .selectAll('circle')
  //     .data(nodes)
  //     .enter()
  //     .append('circle')
  //     .attr('r', (d) => (d.center ? 35 : 30))
  //     .attr('fill', (d) => (d.center ? '#d6b4fc' : '#40a9f3'))  // Blue nodes for all transactions
  //     .call(drag(simulation))
  //     .on('mouseover', function (event, d) {
  //       d3.select(this).attr('fill', (d) => (d.center ? '#d6b4fc' : '#40a9f3'));
  //       tooltip
  //         .style('opacity', 1)
  //         .html(`Address: ${d.id}`)
  //         .style('left', `${event.pageX + 10}px`)
  //         .style('top', `${event.pageY + 10}px`);
  //     })
  //     .on('mouseout', function () {
  //       d3.select(this).attr('fill', (d) => (d.center ? '#d6b4fc' : '#40a9f3'));
  //       tooltip.style('opacity', 0);
  //     });

  //   const text = svg
  //     .append('g')
  //     .attr('class', 'labels')
  //     .selectAll('text')
  //     .data(nodes)
  //     .enter()
  //     .append('text')
  //     .attr('dy', 5)
  //     .attr('dx', -25)
  //     .style('font-size', '12px')
  //     .text((d) => d.id.substring(0, 6) + '...');

  //   const tooltip = d3
  //     .select('body')
  //     .append('div')
  //     .attr('class', 'tooltip')
  //     .style('position', 'absolute')
  //     .style('text-align', 'left')
  //     .style('width', '500px')
  //     .style('padding', '8px')
  //     .style('font', '12px sans-serif')
  //     .style('background', 'lightsteelblue')
  //     .style('border', '1px solid #fff')
  //     .style('border-radius', '8px')
  //     .style('pointer-events', 'none')
  //     .style('opacity', 0);

  //   const showTooltip = (content, x, y) => {
  //     tooltip
  //       .html(content)
  //       .style('left', `${x}px`)
  //       .style('top', `${y}px`)
  //       .style('opacity', 1);
  //   };

  //   const hideTooltip = () => {
  //     tooltip.style('opacity', 0);
  //   };

  //   node.on('mouseover', function (event, d) {
  //     showTooltip(`Address: ${d.id}`, event.pageX + 10, event.pageY + 10);
  //   });

  //   document.addEventListener('click', (event) => {
  //     const isTooltipClick = tooltip.node().contains(event.target);
  //     if (!isTooltipClick) hideTooltip();
  //   });

  //   simulation.on('tick', () => {
  //     link.attr('d', (d, i) => {
  //       const group = linkGroups.get(`${d.source}-${d.target}`);
  //       return group.length > 1 ? generatePathData(d, i, group.length) : `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
  //     });
  //     node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
  //     text.attr('x', (d) => d.x).attr('y', (d) => d.y);
  //   });

  //   function drag(simulation) {
  //     function dragstarted(event, d) {
  //       if (!event.active) simulation.alphaTarget(0.3).restart();
  //       d.fx = d.x;
  //       d.fy = d.y;
  //     }

  //     function dragged(event, d) {
  //       d.fx = event.x;
  //       d.fy = event.y;
  //     }

  //     function dragended(event, d) {
  //       if (!event.active) simulation.alphaTarget(0);
  //       d.fx = null;
  //       d.fy = null;
  //     }

  //     return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
  //   }
  // }


  return (
    <div className='overflow-hidden'>
      <div className="flex flex-col items-center justify-center py-10 px-4 bg-white dark:bg-[#001938]">
        {!isInputEntered && (
          <>
            <h1 className="text-3xl font-bold text-center text-black dark:text-white mb-4">SecureTrace Visualizer</h1>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6 max-w-2xl font-semibold">
              SecureTrace analyzes transaction data using blockchain forensic techniques, enhancing the detection of intricate patterns and potential vulnerabilities.
            </p>
          </>
        )}
        <div className="flex flex-col sm:flex-row items-center w-full md:max-w-3xl ">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter transaction hash or address value"
            className="py-3 px-4 rounded-xl border border-gray-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4 sm:mb-0 sm:mr-4 w-full"
          />
          <button onClick={handleScanClick} className="bg-green-500 w-40 text-black font-semibold py-3 px-8 rounded-xl shadow-md hover:bg-green-600 transition-all duration-300">
            {loading ? 'Loading...' : 'Scan Now'}
          </button>
        </div>
        {validationMessage && (
          <p className={`ml-10 mt-2 ${validationMessage.includes('Invalid') ? 'text-red-500' : 'text-green-500'}`}>
            {validationMessage}
          </p>
        )}
        <div>
          <svg ref={svgRef}></svg>
        </div>
      </div>
      <div className='bg-white dark:bg-[#001938]'>
        {isInputEntered && (
          // <div className="mt-10 mx-20">
          <div className='mx-4 md:mx-32 py-10'>
            <div className="overflow-x-hidden bg-white p-6 rounded-xl border border-black shadow-md shadow-gray-500" id="hide-scrollbar">
              <div className="">
                <div className='flex'>
                  <h3 className="text-2xl font-semibold mt-1 mb-4">Transfers</h3>
                  <div className="flex items-center mb-4">
                    <button
                      className={`px-4 py-2 font-bold ${currentPage1 === 1 ? 'cursor-not-allowed opacity-50 ' : 'cursor-pointer'}`}
                      onClick={() => handlePageChange1(currentPage1 - 1)}
                      disabled={currentPage1 === 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024"><path fill="black" d="M685.248 104.704a64 64 0 0 1 0 90.496L368.448 512l316.8 316.8a64 64 0 0 1-90.496 90.496L232.704 557.248a64 64 0 0 1 0-90.496l362.048-362.048a64 64 0 0 1 90.496 0" /></svg>
                    </button>
                    <span className='font-bold text-xl'>
                      {currentPage1} / {totalPages1}
                    </span>
                    <button
                      className={`px-4 py-2 font-bold ${currentPage1 === totalPages1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      onClick={() => handlePageChange1(currentPage1 + 1)}
                      disabled={currentPage1 === totalPages1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 12 24"><path fill="black" fill-rule="evenodd" d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414" /></svg>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-scroll" id="hide-scrollbar">
                  <table className="w-full text-center">
                    <thead className=''>
                      <tr className="text-gray-500 h-10">
                        <th className='flex justify-center items-center space-x-2 px-4'><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M32 144h448M112 256h288M208 368h96" /></svg><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="black" d="M14.78 3.653a3.936 3.936 0 1 1 5.567 5.567l-3.627 3.627a3.936 3.936 0 0 1-5.88-.353a.75.75 0 0 0-1.18.928a5.436 5.436 0 0 0 8.12.486l3.628-3.628a5.436 5.436 0 1 0-7.688-7.688l-3 3a.75.75 0 0 0 1.06 1.061z" /><path fill="black" d="M7.28 11.153a3.936 3.936 0 0 1 5.88.353a.75.75 0 0 0 1.18-.928a5.436 5.436 0 0 0-8.12-.486L2.592 13.72a5.436 5.436 0 1 0 7.688 7.688l3-3a.75.75 0 1 0-1.06-1.06l-3 3a3.936 3.936 0 0 1-5.567-5.568z" /></svg></th>
                        <th className=' px-4'>
                          <div className="flex justify-center items-center space-x-2"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="black" fill-rule="evenodd" d="m12.6 11.503l3.891 3.891l-.848.849L11.4 12V6h1.2zM12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10m0-1.2a8.8 8.8 0 1 0 0-17.6a8.8 8.8 0 0 0 0 17.6" /></svg>
                            <h1>Time</h1>
                          </div>
                        </th>
                        <th className=' px-6'>
                          <div className="flex justify-center items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M32 144h448M112 256h288M208 368h96" /></svg>
                            <h1>From</h1>
                          </div>
                        </th>
                        <th className='px-6'>
                          <div className="flex justify-center items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M32 144h448M112 256h288M208 368h96" /></svg>
                            <h1>To</h1>
                          </div>
                        </th>
                        <th className=' px-4'>
                          <div className="flex justify-center items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M32 144h448M112 256h288M208 368h96" /></svg>
                            <h1>Value</h1>
                          </div>
                        </th>
                        <th className=' px-4'>
                          <div className="flex justify-center items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M32 144h448M112 256h288M208 368h96" /></svg>
                            <h1>Token</h1>
                          </div>
                        </th>
                        <th className=' px-4'>
                          <div className="flex justify-center items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M32 144h448M112 256h288M208 368h96" /></svg>
                            <h1>Amount</h1>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className=" text-center">
                      {currentRows1 && currentRows1.length > 0 ?
                        currentRows1.map((transfer, index) => {
                          const { logo, timestamp, from, to, value, tokenName, tokenPrice, blockNum, chain } = transfer;
                          return (
                            <tr key={index} className="border-t h-12 text-center bg-red-600 odd:bg-[#F4F4F4] even:bg-white px-2 py-2">
                              <td className='flex justify-center items-center mt-2 px-4'><img src={logo} alt={tokenName} /></td>
                              <td className="text-green-500 me-3 px-4">{new Date(timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                              <td className="me-3 px-4">
                                <button
                                  className="text-center"
                                  onClick={() => handleLinkClick(from, blockNum, false, chain)}
                                >
                                  {from.slice(0, 5) + "..." + from.slice(-4)}
                                </button>
                              </td>
                              <td className="me-3 px-4">
                                <button
                                  className="text-center"
                                  onClick={() => handleLinkClick(to, blockNum, true, chain)}
                                >
                                  {to.slice(0, 5) + "..." + to.slice(-4)}
                                </button>
                              </td>
                              <td className="text-green-500 px-4">
                                {parseFloat(tokenPrice).toFixed(2)}
                              </td>
                              <td className="px-4">{tokenName}</td>
                              <td className="px-4">{parseFloat(value).toFixed(2)}</td>
                            </tr>
                          );
                        })
                        :
                        (
                          <tr className="border-t h-12 odd:bg-[#F4F4F4] even:bg-white ">
                            <td className='flex justify-center items-center mt-2'><img src={btc} alt="Token Name" /></td>
                            <td className="text-green-500 text-center">0 days ago</td>
                            <td className="text-center">0000....000</td>
                            <td className="text-center">0000....000</td>
                            <td className='text-green-500'>0.00</td>
                            {/* <td className="text-green-500">
                                            0.00
                                        </td> */}
                            <td>BTC</td>
                            <td>$0.00</td>
                          </tr>
                        )
                      }


                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className=''>
        <Footer/>
      </div>
    </div>
  );
};

export default Visualizer;
